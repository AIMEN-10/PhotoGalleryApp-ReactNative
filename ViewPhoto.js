import React, { useState ,useEffect} from 'react';
import { View, Image, StyleSheet, SafeAreaView, Text, Dimensions, TouchableWithoutFeedback, BackHandler } from 'react-native';
import Editnavbar from './Editnavbar';
import colors from './theme/colors';

const { width } = Dimensions.get('window');

const ViewPhoto = ({ route }) => {
  const { item, data } = route.params;
  const parts = data.split(';');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageTap = () => {
    if (isModalOpen) {
      setIsModalOpen(false); // close modal and expand image
    }
  };


 useEffect(() => {
    const backAction = () => {
      if (isModalOpen) {
        setIsModalOpen(false);
        return true; // Prevent default back behavior
      }
      return false; // Allow default back behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove(); // Cleanup on unmount
  }, [isModalOpen]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.allControlsContainer}>
        <Text style={styles.text}>{parts[2] || 'Unknown'}</Text>
      </View>

      <TouchableWithoutFeedback onPress={handleImageTap}>
        <View style={[styles.imageWrapper, { flex: isModalOpen ? 0.5 : 1 }]}>
          <Image
            source={{ uri: item.path }}
            style={styles.image}
          />
        </View>
      </TouchableWithoutFeedback>

      <View style={{ flex: isModalOpen ? 0.5 : 0 }}>
        <Editnavbar imageId={item.id} onModalToggle={setIsModalOpen} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  allControlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  text: {
    color: colors.dark,
    fontSize: 40,
    padding: 5,
  },
  imageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: '100%',
    resizeMode: 'contain',
  },
});

export default ViewPhoto;