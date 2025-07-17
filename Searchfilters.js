import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, BackHandler, ScrollView ,TouchableOpacity} from 'react-native';
import { Checkbox, Button, Chip } from 'react-native-paper';
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
import { checkAndUnlinkIfExists } from './Databasequeries';
import FoldersData from './ViewModels/FoldersData'; 


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

const Searchfilters = ({ route }) => {
  const { data } = route.params || {};
  console.log(data);
  let parts = [];
  if (typeof data === 'string' && data.includes(';')) {
    parts = data.split(';');

  }



  const navigation = useNavigation();

  const [photos, setPhotos] = useState([]);
  const { photos: fetchedPhotosFromHook, loadImages } = ImageData();

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

  const [faceCardPersons, setFaceCardPersons] = useState([]);

  const [showComparisonCard, setShowComparisonCard] = useState(true);
  const [faceIndex, setFaceIndex] = useState(0);
  const [face, setface] = useState();
const [filteredFolders,setfilteredFolders] = useState([]);
const [activeChip, setActiveChip] = useState('Images'); // Default to images
const [viewMode, setViewMode] = useState('images'); // 'images' or 'people'

  const reloadData = async () => {
    if (!data) return;

    if (Array.isArray(data) && data.every(item => typeof item === 'object' && item !== null && !Array.isArray(item))) {
      setPhotos(data);
    } else {
      const result = data === 'Label' ? fetchedPhotosFromHook : await Filteredimages(data);
      if (parts[0] === 'Person') {
        const excludePersonId = parts[1];
        // const personrecords = await getAllPersons();
        // console.log('Person(s) for', name, ':', personDataList);

        // const Links = await getAllPersonLinks();



        if (result) {
          const matchedFace = [];  // holds the matched face
          const otherFaces = [];   // holds other persons

          result.forEach(img => {
            const persons = img.persons || [];

            persons.forEach(person => {
              if (String(person.id) === String(excludePersonId)) {
                if (matchedFace.length === 0) {
                  matchedFace.push(person); // Only push the first matched face
                }
              } else {
                otherFaces.push(person);
              }
            });
          });
          // console.log('Matched Face:', matchedFace);
          // console.log('Other Faces:', otherFaces);
          setface(matchedFace[0] || null);
          setFaceCardPersons(otherFaces);


        };



      }
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
      const init = async () => {
        await loadImages()
        await reloadData();
      }
      init();
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
  const advanceFacePair = () => {
    const nextIndex = faceIndex + 1;
    if (nextIndex >= faceCardPersons.length) {
      setShowComparisonCard(false); // End after showing last face
    } else {
      setFaceIndex(nextIndex);
    }
  };

  const removeEmbeddingName = async (emb1, emb2) => {
    try {
      const response = await fetch(`${baseUrl}/remove_embedding_name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emb1, emb2 }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Success:', data.message);
        // You can trigger UI updates or toast messages here
      } else {
        console.error('Error:', data.message);
        // Handle error in UI
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };
  const displayText =
    parts[2] || (data.includes?.('Label') ? 'Label' : 'Search Results');
  
 const handleNavigation = (viewMode, id, name) => {
  let dataType = '';

  switch (viewMode) {
    case 'people':
      dataType = 'Person';
      break;
    case 'event':
      dataType = 'Event';
      break;
    case 'location':
      dataType = 'Location';
      break;
    case 'date':
      dataType = 'Date';
      break;
    default:
      console.log('Unknown view mode:', viewMode);
  }

  navigation.navigate('Images', { data: `${dataType};${id};${name}` });
};


  const [previousPhotos, setPreviousPhotos] = useState([]);
const handleChipPress = async (chipText) => {
  switch (chipText) {
    case 'People':
      await saveAndSetView({ mode: 'people', folderType: 'Person', dataKey: 'Names' });
      break;
    case 'Event':
      await saveAndSetView({ mode: 'event', folderType: 'Event', dataKey: null });
      break;
    case 'Location':
      await saveAndSetView({ mode: 'location', folderType: 'Location', dataKey: 'Locations' });
      break;
    case 'Date':
      await saveAndSetView({ mode: 'date', folderType: 'Date', dataKey: 'CaptureDates' });
      break;
    case 'Images':
      setViewMode('images');
      setPhotos(previousPhotos);
      break;
    default:
      console.log('Unknown chip selected:', chipText);
  }
};


const saveAndSetView = async ({ mode, folderType, dataKey }) => {
  setPreviousPhotos(photos); // Save current photos

  const folders = await FoldersData({ data: folderType });
  console.log('Fetched folders:', folders); // Debugging log

  let filtered = [];

  if (folderType === 'Event') {
    const selectedEventIds = Object.keys(data.SelectedEvents || {}).filter(
      id => data.SelectedEvents[id]
    );

    filtered = folders.filter(folder =>
      selectedEventIds.includes(String(folder.id)) // Compare as string
    );
  } else {
    const selectedNames = (data?.[dataKey] || []).map(name =>
      name?.trim().toLowerCase()
    ).filter(Boolean); // Remove empty strings

    filtered = folders.filter(folder =>
      selectedNames.includes(folder?.name?.trim().toLowerCase())
    );
  }

  console.log('Filtered folders:', filtered); // Debugging log
  setfilteredFolders(filtered);
  setViewMode(mode);
};



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.container}>
        <View style={styles.allControlsContainer}>
          <Allcontrols
            text={displayText
              // parts[2]
              // || (data.includes?.('Label') ? 'Label' : 'Search Results')
            }

            selectMode={selectMode}
            selectedItems={selectedItems}
            onBulkEdit={openEditModal}  // Open modal when bulk edit is clicked
            onRefresh={refreshData}
          />
        </View>

        <View style={styles.gridContainer}>
          <View style={{ alignItems: 'flex-start', marginBottom: 10 }}>
            {displayText === 'Search Results' && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                <ScrollView horizontal contentContainerStyle={styles.chipRow}>

                  {['Images', 'People', 'Event', 'Location', 'Date'].map((chipText, index) => (

                    <Chip
                      key={index}
                      style={styles.chip}
                      textStyle={{ color: colors.secondary }}
                      closeIconColor={colors.secondary}
                       onPress={() => handleChipPress(chipText)} 
                    >
                      {chipText}
                    </Chip>
                  ))}
                </ScrollView>
              </View>
            )}

            {showComparisonCard && faceCardPersons.length >= 1 && face && (

              <View style={styles.comparisonCard}>
                {/* Close Icon */}
                <Pressable style={styles.crossIcon} onPress={() => setShowComparisonCard(false)}>
                  <Text style={styles.crossText}>✕</Text>
                </Pressable>

                {/* Face Images */}
                <View style={styles.faceImagesContainer}>
                  {/* Fixed Face (Face 1 = faceCardPersons[0]) */}
                  {face && (
                    <View key={`face1-${face.id}`} style={styles.faceWrapper}>
                      {console.log(face)}
                      <FastImage
                        source={{
                          uri:
                            face.path.startsWith('file://') ||
                              face.path.startsWith('content://') ||
                              face.path.startsWith('http')
                              ? face.path
                              : baseUrl + face.path,
                          priority: FastImage.priority.normal,
                        }}
                        style={styles.faceImageNew}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                    </View>
                  )}

                  {/* Changing Face (Face 2 = faceCardPersons[faceIndex]) */}
                  {faceCardPersons[faceIndex] && (
                    <View key={`face2-${faceCardPersons[faceIndex].id}`} style={styles.faceWrapper}>
                      <FastImage
                        source={{
                          uri:
                            faceCardPersons[faceIndex].path.startsWith('file://') ||
                              faceCardPersons[faceIndex].path.startsWith('content://') ||
                              faceCardPersons[faceIndex].path.startsWith('http')
                              ? faceCardPersons[faceIndex].path
                              : baseUrl + faceCardPersons[faceIndex].path,
                          priority: FastImage.priority.normal,
                        }}
                        style={styles.faceImageNew}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                    </View>
                  )}
                </View>

                {/* Buttons */}
                <View style={styles.actionButtonsContainer}>
                  <Pressable
                    style={[styles.actionButton, { backgroundColor: '#28a745' }]}
                    onPress={() => {
                      console.log('Faces are SAME');
                      advanceFacePair();
                    }}
                  >
                    <Text style={styles.actionText}>Same</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.actionButton, { backgroundColor: '#dc3545' }]}
                    onPress={() => {
                      console.log('Faces are DIFFERENT');
                      const person = faceCardPersons[faceIndex]
                      console.log(person)

                      checkAndUnlinkIfExists(face.id, person.id)
                        .then((message) => {
                          console.log(message);
                          if (message === 'Link removed.') {
                            console.log('Link removed successfully.');
                            // Continue processing after unlink
                          } else {
                            console.log('removing embedding');
                            // Maybe inform the user no link was found
                            emb1 = face.path.split('/').pop();
                            emb2 = person.path.split('/').pop();
                            console.log('emb1:', emb1, 'emb2:', emb2);
                            removeEmbeddingName(emb1, emb2);
                          }
                        })
                        .catch((error) => {
                          console.error('Error:', error);
                        });

                      advanceFacePair();
                    }}
                  >
                    <Text style={styles.actionText}>Different</Text>
                  </Pressable>
                </View>
              </View>

            )}

            {selectMode && (
              <Button
                mode="contained"
                style={styles.button}
                labelStyle={styles.buttonText}
                onPress={() => {
                  if (!selectMode) setSelectMode(true);
                  const allIds = photos.map((photo) => photo.id);
                  setSelectedItems(allIds);
                }}
              >
                Select All
              </Button>



            )}
          </View>
  {['people', 'event', 'location', 'date'].includes(viewMode) && (
  <View style={styles.grid}>
    {filteredFolders.map((item, index) => (
      <FolderCard
        key={`${item.id ?? 'missing'}-${index}`}
        item={item}
        onPress={() => handleNavigation(viewMode, item.id, item.name)}
      />
    ))}
  </View>
)}

 

{viewMode === 'images' && (
  photos.length > 0 ? (
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
  )
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

const FolderCard = ({ item, onPress }) => (
  <View style={styles.folderborder}>
    <TouchableOpacity onPress={() => onPress(item.id, item.name)}>
      <FastImage
        source={{
          uri:
            item.imagePath.startsWith('file://') ||
            item.imagePath.startsWith('content://') ||
            item.imagePath.startsWith('http')
              ? item.imagePath
              : baseUrl + item.imagePath,
        }}
        style={styles.imagefolders}
      />
      <Text style={styles.imageName}>{item.name}</Text>
    </TouchableOpacity>
  </View>
);

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
  button: {
    backgroundColor: colors.primary,
    borderColor: colors.dark,
    borderWidth: 1
  },
  buttonText: {
    color: colors.dark // Replace with your colors.secondary value
  },
  // Card styles
  comparisonCard: {
    backgroundColor: '#fff9e6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
    marginHorizontal: 10,
    alignItems: 'center',
    position: 'relative',
  },

  crossIcon: {
    position: 'absolute',
    top: 8,
    right: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    padding: 5,
    elevation: 2,
  },

  crossText: {
    fontSize: 16,
    color: '#333',
  },

  faceImagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
    marginRight: 20,
    width: '100%',
  },

  faceWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  faceImageNew: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },

  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },

  actionButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 10,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 2,
  },

  actionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  chip: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    borderColor: colors.dark,
    borderWidth: 1,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  //folders
   grid: {
    paddingTop: 50,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    minWidth: '100%',
    padding: 20,
  },
//   folderGrid: {
//   flexDirection: 'row',
//   flexWrap: 'wrap',
//   justifyContent: 'space-between',
//   marginBottom: 15,
// },
folderborder: {
    width: '48%',
    marginBottom: 20,
    padding: 15,
    borderWidth: 3,
    borderRadius: 15,
    backgroundColor: '#fff',
    elevation: 15,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colors.primary,
  },
  imagefolders: {
    width: 100,
    height: 80,
    resizeMode:'contain',
    borderRadius: 10,
  },
  imageName: {
    color: 'black',
    textAlign: 'center',
  },
});

export default Searchfilters;
