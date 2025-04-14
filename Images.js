import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Pressable, FlatList,PermissionsAndroid,
  Platform, } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from './theme/colors';
import Allcontrols from './Allcontrols';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
// import PhotoManager from 'react-native-photo-manager';  // Assuming you're using this library
import { requestMediaLibraryPermission } from './Permission'; // adjust path accordingly


const Images = ({ route, navigation }) => {
  const { data } = route.params || {};  // Get folder data passed from the previous screen
  const [photos, setPhotos] = useState([]);
  // Handle image press (you can replace this with your actual navigation or action)
  const handleImagePress = (item) => {
    console.log("Navigating to ViewPhoto with item:", item);
    navigation.navigate("ViewPhoto", { item }); // Pass 'item' properly to the next screen
    //navigation.navigate("Editnavbar", { item });
  };

 
  useEffect(() => {
    const init = async () => {
      const hasPermission = await requestMediaLibraryPermission();
      if (hasPermission) {
        getAllPhotos();
      } else {
        console.warn('Permission not granted');
      }
    };

    init();
  }, []);

  const getAllPhotos = () => {
    CameraRoll.getPhotos({
      first: 2,
      assetType: 'Photos',
    })
      .then(r => {
        // this.setState({ photos: r.edges });
        console.log(JSON.stringify(r.edges));
        setPhotos(r.edges)
      })
      .catch((err) => {
        console.error("Failed to load photos:", err);

      }); 
  }
  

  return (
    <View style={styles.container}>
      <View style={styles.allControlsContainer}>
        {/* Allcontrols Component */}
        <Allcontrols text='Sir Afrasiab' />
      </View>

      <View style={styles.contentContainer}>

        {photos.length > 0 ? (
          <FlatList
            //style={{justifyContent='space-between'}}
            data={photos}
            scrollEnabled={true}
            keyExtractor={(item, index) => index.toString()}
            numColumns={3}  // Display 3 items per row
            renderItem={({ item }) => (
              //const imageUrl = baseUrl + item.path.replace('~', '');
              <Pressable
                style={styles.imageContainer}
                //onPress={()=>{navigation.navigate("Home")}}
                onPress={() => { handleImagePress(item) }}  // Handle press on image
              >
                {/* //<Text>{item.id}</Text> */}

                <Image
                  source={{ uri: item.node.image.uri }}  // Use the URL of the image returned from the backend
                  style={styles.image}

                />

              </Pressable>
            )}
          />
        ) : (
          <Text style={{ backgroundColor: colors.dark }}>No images found</Text>

        )}



      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensures that the container fills the entire screen
    //padding: 10,
    //backgroundColor: colors.white, // Background color for container
  },
  allControlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,// Adjusts spacing between controls and the image container
  },
  contentContainer: {
    flex: 1,
    marginTop: 80,
    padding: 10,
    flexDirection: 'row',
    gap: 20
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: 'grey',
    overflow: 'hidden', // Ensures rounded corners for image inside container
    backgroundColor: 'red'
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Ensures the image covers the entire container
    borderRadius: 10, // Optional: add a border radius to images for rounded corners
  },
  imageName: {
    marginTop: 10,
    color: colors.dark,
    fontSize: 16,
    textAlign: 'center', // Centers the text below the image
  },
});

export default Images;
