import React, { useState, useEffect ,useRef} from 'react';
import { View, Image, StyleSheet, SafeAreaView, Text, Dimensions, TouchableWithoutFeedback, BackHandler, ScrollView ,Alert} from 'react-native';
import Editnavbar from './Editnavbar';
import colors from './theme/colors';
import { getImageDetails,getPersonAndLinkedList } from './Databasequeries';
import { useNavigation } from '@react-navigation/native';
import { PanResponder } from 'react-native';


const { width } = Dimensions.get('window');

const ViewPhoto = ({ route }) => {

  const { allImages, currentIndex ,data} = route.params;
  // console.log("1",allImages,"2",currentIndex,"3",data);
  const initialIndex = allImages.findIndex(img => img.id === currentIndex.id);
const [currentImageIndex, setCurrentImageIndex] = useState(initialIndex);
const [item, setItem] = useState(allImages[initialIndex]);

  // const { item, data } = route.params;
  let parts;
  try {
   parts = data.split(';');
  } catch (error) {
    parts=["","","Search Results"];
  }
  

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [persons, setpersons] = useState([]);
  const [showFaces, setShowFaces] = useState(false);
  const navigation = useNavigation();


 const moveToNextImage = () => {
  const nextIndex = currentImageIndex + 1;

  if (nextIndex < allImages.length) {
    setCurrentImageIndex(nextIndex);
    setItem(allImages[nextIndex]);
    setpersons([]);
    setShowFaces(false);
  } else {
    // Reached end of list — show message and exit gracefully
    Alert.alert("End", "No more images available.");
    // setItem(null); // Clear image
    navigation.goBack(); // Or navigate somewhere else
  }
};

if (!item) {
  // Optional: show message before navigating back
  useEffect(() => {
    Alert.alert("Deleted", "No more images available.");
    navigation.goBack();
  }, []);
  
  return null;
}


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


 const currentIndexRef = useRef(currentImageIndex);

useEffect(() => {
  currentIndexRef.current = currentImageIndex;
}, [currentImageIndex]);

const panResponder = useRef(
  PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => false, // Let taps go through at start
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 20;  // Start pan responder if horizontal swipe detected
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx > 50) {
        if (currentIndexRef.current > 0) {
          const newIndex = currentIndexRef.current - 1;
          setCurrentImageIndex(newIndex);
          setItem(allImages[newIndex]);
          setpersons([]);
          setShowFaces(false);
        }
      } else if (gestureState.dx < -50) {
        if (currentIndexRef.current < allImages.length - 1) {
          const newIndex = currentIndexRef.current + 1;
          setCurrentImageIndex(newIndex);
          setItem(allImages[newIndex]);
          setpersons([]);
          setShowFaces(false);
        }
      }
    },
  })
).current;



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.allControlsContainer}>
        <Text style={styles.text}>{parts?.[2] || 'Unknown'}</Text>
      </View>


      <View style={[styles.imageWrapper, { flex: isModalOpen ? 0.5 : 1 }]} {...panResponder.panHandlers}>

  <TouchableWithoutFeedback onPress={handleImageTap}>
    {item && (
    <Image
      source={{ uri: item.path }}
      style={styles.image}
    />
    )}
  </TouchableWithoutFeedback>

  {showFaces && persons.length > 0 && (
  <View style={styles.facesOverlay}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {persons.map((person, index) => {
        const isUnknown =
          !person.person_name || person.person_name.toLowerCase() === 'unknown' ;

        return (
          <TouchableWithoutFeedback
            key={person.person_id || index}
            onPress={() => showtrainingimages(person.person_id)}
          >
            <View style={styles.faceContainer}>
              <Image
                source={{ uri: baseUrl + person.person_path }}
                style={styles.faceImage}
              />
              {isUnknown && (
                <Image
                  source={require('./asset/qm.png')}
                  style={styles.questionMark}
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        );
      })}
    </ScrollView>
  </View>
)}


</View>





      <View style={{ flex: isModalOpen ? 0.5 : 0 }}>
        <Editnavbar imageId={item.id} onModalToggle={setIsModalOpen} onDelete={moveToNextImage}/>
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


  // faceImage: {
  //   width: 80,
  //   height: 80,
  //   borderRadius: 8,
  //   marginRight: 10,
  //   resizeMode: 'cover',
  // },
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
faceContainer: {
  position: 'relative',
  marginRight: 8, // spacing between faces
},

faceImage: {
  width: 80,
  height: 80,
  borderRadius: 40, // circular image
},

questionMark: {
  position: 'absolute',
  bottom: 4,
  right: 4,
  width: 20,
  height: 20,
  backgroundColor: '#fff',
  borderRadius: 10,
},


});

export default ViewPhoto;