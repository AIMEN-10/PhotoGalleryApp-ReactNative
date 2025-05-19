import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, SafeAreaView, Text, Dimensions, TouchableWithoutFeedback, BackHandler ,ScrollView} from 'react-native';
import Editnavbar from './Editnavbar';
import colors from './theme/colors';
import { getImageDetails } from './Databasequeries';

const { width } = Dimensions.get('window');

const ViewPhoto = ({ route }) => {
  const { item, data } = route.params;
  const parts = data.split(';');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [persons, setpersons] = useState([]);

  const handleImageTap = async () => {
    if (isModalOpen) {
      setIsModalOpen(false); // close modal and expand image
    }
    else {
      const imageDet = await getImageDetails(item.id);
      if (imageDet.persons.length > 0) {
        setpersons(imageDet.persons);
         setIsModalOpen(true);
        console.log("done");
        console.log(imageDet.persons);
      }
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
      {isModalOpen && persons.length > 0 && (
  <View style={styles.facesScrollContainer}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {persons.map((person, index) => (
        <Image
          key={index}
          source={{ uri: baseUrl+person.person_path }} // ✅ Use person.person_path, not person_path directly
          style={styles.faceImage}
        />
      ))}
    </ScrollView>
  </View>
)}


      <View style={{ flex: isModalOpen ? 0.5 : 0 }}>
        <Editnavbar imageId={item.id} onModalToggle={setIsModalOpen} />
      </View>

      {/* <View style={{ flex: isModalOpen ? 0.5 : 0 }}>
        <Editnavbar imageId={item.id} onModalToggle={setIsModalOpen} />
      </View> */}
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

  facesScrollContainer: {
    height: 100,
    backgroundColor: '#f9f9f9',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },

  faceImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    resizeMode: 'cover',
  },

});

export default ViewPhoto;