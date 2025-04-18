import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Pressable, PermissionsAndroid, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from './theme/colors';
import Allcontrols from './Allcontrols';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { requestMediaLibraryPermission } from './Permission';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewPhoto from './ViewPhoto';
import { FlatList } from 'react-native-gesture-handler'



const Images = ({ route }) => {
  const { data } = route.params || {};
  const navigation = useNavigation();
  const [photos, setPhotos] = useState([]);

  const handleImagePress = (item) => {
    // console.log("Navigating to ViewPhoto with item:", item);
    navigation.navigate("ViewPhoto", { item: item, data: data });
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

  const getAllPhotos = async () => {
    // CameraRoll.getPhotos({
    //   first: 20,
    //   assetType: 'Photos',

    // })
    //   .then(r => {
    //     setPhotos(r.edges)
    //   })
    //   .catch((err) => {
    //     console.error("Failed to load photos:", err);

    //   });

    let hasNextPage = true;
    let after = null;
    let allPhotos = [];
  
    try {
      while (hasNextPage) {
        const result = await CameraRoll.getPhotos({
          first: 100, // reasonable batch size
          assetType: 'Photos',
          after: after,
        });
  
        allPhotos = allPhotos.concat(result.edges);
        hasNextPage = result.page_info.has_next_page;
        after = result.page_info.end_cursor;
  
        // Optional: Break if too many
        if (allPhotos.length >= 1000) break; // Prevent overloading
      }
  
      setPhotos(allPhotos);
    } catch (err) {
      console.error("Error fetching paginated photos:", err);
    }

}


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.container}>
        <View style={styles.allControlsContainer}>
          <Allcontrols text={data} />
        </View>
        {/* <View style={{ paddingTop: 10 }}> */}
          <View style={styles.gridContainer}>

            {photos.length > 0 ? (
              <FlatList
                data={photos}
                keyExtractor={(item, index) => index.toString()}
                numColumns={3}
                scrollEnabled={true}

                columnWrapperStyle={{
                  marginRight: 10,
                  justifyContent: 'space-between',  // Space items equally across rows
                  flexWrap: 'wrap',  // Allow items to wrap into multiple rows
                }}


                renderItem={({ item }) => (
                  <Pressable
                    style={styles.imageContainer}
                    onPress={() => handleImagePress(item)}
                  >
                    {/* {console.log(item.node.image.uri)} */}
                    <Image
                      source={{ uri: item.node.image.uri }}
                      style={styles.image}
                    />
                  </Pressable>
                )}
              />
            ) : (
              <Text style={styles.noImagesText}>No images found</Text>
            )}
          </View>
        {/* </View> */}
      </View></SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  allControlsContainer: {
    position: 'absolute',  // This makes the navbar float above other elements
    top: 0,
    left: 0,
    right: 0,

  },
  gridContainer: {
    flex: 1, // FlatList takes remaining space
    paddingHorizontal: 10,
    paddingBottom: 20,
    paddingTop:100
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
    resizeMode: 'cover',
    borderRadius: 10,
    backgroundColor: 'grey',
  },
  noImagesText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 18,
    color: colors.dark,
  },
});


export default Images;
