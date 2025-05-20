import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, SafeAreaView, Text, Dimensions, TouchableWithoutFeedback, BackHandler, ScrollView } from 'react-native';
import Editnavbar from './Editnavbar';
import colors from './theme/colors';
import { getImageDetails,getPersonAndLinkedList } from './Databasequeries';
import { useNavigation } from '@react-navigation/native';


const { width } = Dimensions.get('window');

const ViewPhoto = ({ route }) => {
  const { item, data } = route.params;
  const parts = data.split(';');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [persons, setpersons] = useState([]);
  const [showFaces, setShowFaces] = useState(false);
  const navigation = useNavigation();


  const handleImageTap = async () => {
    if (isModalOpen) {
      setIsModalOpen(false);
    }
    else {
      // const imageDet = await getImageDetails(item.id);
      // if (imageDet.persons.length > 0) {
      //   setpersons(imageDet.persons);
      //   //  setIsModalOpen(true);
      //   console.log("done");
      //   console.log(imageDet.persons);
      // }
      if (showFaces) {
        setShowFaces(false);
      } else {
        if (persons.length === 0) {
          const imageDet = await getImageDetails(item.id);
          if (imageDet.persons.length > 0) {
            setpersons(imageDet.persons);
          }
        }
        setShowFaces(true);
      }
    }
  };

  const showtrainingimages = async (id) => {
    console.log("showtrainingimages",id);

    getPersonAndLinkedList(id, (personList, statusCode) => {
    if (statusCode === 200) {
      console.log("✅ Linked persons found:", personList);
      navigation.navigate('Images', { data:personList });
      
       
    } else if (statusCode === 404) {
      console.log("❌ Person not found.");
    } else {
      console.log("⚠️ Error fetching linked data.");
    }
  });
  }
  useEffect(() => {
    const backAction = () => {
      if (isModalOpen) {
        setIsModalOpen(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
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

          {showFaces && persons.length > 0 && (
            <View style={styles.facesOverlay}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {persons.map((person, index) => (
                  <TouchableWithoutFeedback
                    key={person.person_id || index} 
                    onPress={() => showtrainingimages(person.person_id)} 
                  >
                    <Image
                      source={{ uri: baseUrl + person.person_path }}
                      style={styles.faceImage}
                    />
                  </TouchableWithoutFeedback>
                ))}
              </ScrollView>
            </View>
          )}

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
    position: 'relative', // This is critical for overlaying children absolutely
    width: width,
    height: '100%',
  },

  image: {
    width: width,
    height: '100%',
    resizeMode: 'contain',
  },

  facesScrollContainerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#f9f9f9',
    paddingVertical: 5,
    paddingHorizontal: 10,
    zIndex: 5,
  },


  faceImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    resizeMode: 'cover',
  },
  facesOverlay: {
    position: 'absolute',
    bottom: 60, // Distance from bottom of image
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Optional: subtle overlay background
    paddingVertical: 5,
    zIndex: 10,
  },


});

export default ViewPhoto;