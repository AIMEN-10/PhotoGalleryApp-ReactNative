import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, BackHandler } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import colors from './theme/colors';
import Allcontrols from './Allcontrols';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import ImageData from './ViewModels/ImageData';
import Filteredimages from './ViewModels/Filteredimages';
import FastImage from 'react-native-fast-image';
import ReactNativeModal from 'react-native-modal';
import Editscreen from './Editscreen';
import { useFocusEffect } from '@react-navigation/native';


const ImageItem = ({ item, selectMode, selectedItems, onPress, onLongPress }) => {
  const isSelected = selectedItems.includes(item.id);

  return (
    <Pressable
      style={styles.imageContainer}
      onPress={() => onPress(item)}
      onLongPress={onLongPress}
    >
      <FastImage
        source={{
          uri: item.path.startsWith('file://') ||
            item.path.startsWith('content://') ||
            item.path.startsWith('http')
            ? item.path
            : baseUrl + item.path,

          priority: FastImage.priority.normal
        }}
        style={styles.image}
        resizeMode={FastImage.resizeMode.cover}
      />
      {selectMode && (
        <View style={styles.checkboxOverlay}>
          <Checkbox
            status={isSelected ? 'checked' : 'unchecked'}
            onPress={() => onPress(item)}
            color={isSelected ? colors.primary : undefined}
            rippleColor={colors.primary}
          />
        </View>
      )}
    </Pressable>
  );
};

const Images = ({ route }) => {
  const { data } = route.params || {};
  console.log(data);
  let parts = [];
  if (typeof data === 'string' && data.includes(';')) {
    parts = data.split(';');

  }



  const navigation = useNavigation();

  const [photos, setPhotos] = useState([]);
  const { photos: fetchedPhotosFromHook } = ImageData();

  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);  // State for modal visibility

  const selectModeRef = useRef(selectMode);
  const selectedItemsRef = useRef(new Set());

  useEffect(() => {
    selectModeRef.current = selectMode;
  }, [selectMode]);

  useEffect(() => {
    selectedItemsRef.current = new Set(selectedItems);
  }, [selectedItems]);

  //   useEffect(() => {
  //     const loadData = async () => {
  //       if (!data) return;
  //       if (Array.isArray(data) && data.every(item => typeof item === 'object' && item !== null && !Array.isArray(item))) {
  //     setPhotos(data);

  //   console.log('Data is an array of objects');
  // } else {
  //   console.log('Data is not an array of objects');

  //       const result = data === 'Label' ? fetchedPhotosFromHook : await Filteredimages(data);
  //       // console.log("here:",result);
  //       setPhotos(result);
  //     };
  //   }
  //     loadData();
  //   }, [data, fetchedPhotosFromHook]);


  const reloadData = async () => {
    if (!data) return;

    if (Array.isArray(data) && data.every(item => typeof item === 'object' && item !== null && !Array.isArray(item))) {
      setPhotos(data);
    } else {
      if (result === 'Label') {
        console.log("IS LABEL");
      }
      const result = data === 'Label' ? fetchedPhotosFromHook : await Filteredimages(data);
      if (Array.isArray(result)) {
        setPhotos(result);
      } else {
        console.log('Unexpected result from Filteredimages or ImageData:', result);
        setPhotos([]); // fallback to prevent undefined
      }
    }
  };
  useFocusEffect(
    useCallback(() => {


      reloadData();
    }, [data, fetchedPhotosFromHook])
  );


  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (selectModeRef.current) {
          // Exit selection mode instead of navigating back
          setSelectMode(false);
          setSelectedItems([]);
          return true; // prevent default behavior
        }
        return false; // allow default back behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  useEffect(() => {
    selectModeRef.current = selectMode;
  }, [selectMode]);

  const handleImagePress = useCallback(
    // (item) => navigation.navigate('ViewPhoto', { item, data }),
    // [navigation, data]

    (item) => navigation.navigate('ViewPhoto', {



      allImages: photos,  // array of image objects
      currentIndex: item,
      data: data,
    })

  );

  const handleLongPress = useCallback(() => {
    setSelectMode(true);
    setSelectedItems([]);
  }, []);

  const toggleSelection = useCallback((item) => {
    setSelectedItems((prev) =>
      prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
    );
  }, []);

  const handleItemPress = useCallback(
    (item) => {
      if (selectModeRef.current) {
        toggleSelection(item);
      } else {
        handleImagePress(item);
      }
    },
    [handleImagePress, toggleSelection]
  );

  const openEditModal = () => {
    setIsModalVisible(true);  // Open the modal
  };

  const closeModal = () => {
    setIsModalVisible(false);  // Close the modal
  };

  const refreshData = () => {
    reloadData();
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.container}>
        <View style={styles.allControlsContainer}>
          <Allcontrols
            text={parts[2] || 'Label'}
            selectMode={selectMode}
            selectedItems={selectedItems}
            onBulkEdit={openEditModal}  // Open modal when bulk edit is clicked
            onRefresh={refreshData}
          />
        </View>

        <View style={styles.gridContainer}>

          {photos.length > 0 ? (
            <FlashList
              data={photos}
              extraData={{ selectMode, selectedItems }}
              keyExtractor={(item) => item.id?.toString()}
              numColumns={3}
              estimatedItemSize={120}
              renderItem={({ item }) => (
                <ImageItem
                  item={item}
                  onPress={handleItemPress}
                  onLongPress={handleLongPress}
                  selectedItems={selectedItems}
                  selectMode={selectMode}
                />
              )}
              columnWrapperStyle={{
                justifyContent: 'space-between',
                marginBottom: 15,
              }}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.noImagesText}>No images found</Text>
          )}
        </View>
      </View>

      {/* Modal to show EditScreen */}
      <ReactNativeModal
        isVisible={isModalVisible}
        onBackdropPress={closeModal}  // Close on backdrop click
        backdropOpacity={0.5}  // Adjust backdrop opacity
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          {/* Close the modal button */}
          <Pressable style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>

          {/* EditScreen inside the modal */}
          <Editscreen
            imageId={selectedItems} // Pass selectedItems to EditScreen
            closeModal={closeModal}  // Optionally pass closeModal to EditScreen to close it from there
          />
        </View>
      </ReactNativeModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  checkboxOverlay: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(66, 63, 53, 0.76)',
    borderRadius: 12,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  allControlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingBottom: 20,
    paddingTop: 100,
  },
  imageContainer: {
    width: 105,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    backgroundColor: 'grey',
  },
  noImagesText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 18,
    color: colors.dark,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#FF0000',
    borderRadius: 5,
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    color: 'white',
  },
});

export default Images;
