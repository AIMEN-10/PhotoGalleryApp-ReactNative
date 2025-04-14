import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Pressable, FlatList,PermissionsAndroid, Platform} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from './theme/colors';
import Allcontrols from './Allcontrols';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import { requestMediaLibraryPermission } from './Permission'; 
import { ScrollView } from 'react-native-gesture-handler';
import ViewPhoto from './ViewPhoto';


const Images = ({ route }) => {
  const { data } = route.params || {};  
  const navigation = useNavigation(); 
  const [photos, setPhotos] = useState([]);

  const handleImagePress = (item) => {
    console.log("Navigating to ViewPhoto with item:", item);
    navigation.navigate("ViewPhoto", { item }); 
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
      first: 20,
      assetType: 'Photos',
      
    })
      .then(r => {
        // this.setState({ photos: r.edges });
        // console.log(JSON.stringify(r.edges));
        //console.log('First image URI:', r.edges[0]?.node.image.uri);

        setPhotos(r.edges)
      })
      .catch((err) => {
        console.error("Failed to load photos:", err);

      }); 
  }
  

  return (
    <View style={styles.container}>
     
      <View style={styles.contentContainer}>
      

        {photos.length > 0 ? (
          <FlatList
          data={photos}
            scrollEnabled={true}
            keyExtractor={(item, index) => index.toString()}
            numColumns={3} 
            

            renderItem={({ item }) => (
              
              <Pressable
                style={styles.imageContainer}
                onPress={() => { handleImagePress(item) }}  
                
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
          <Text style={{ backgroundColor: colors.dark }}>No images found</Text>

        )}

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  contentContainer: {
    flex: 1,
    marginTop: 80,
    padding: 10,
   justifyContent:'space-between'
  },
  imageContainer: {
    width: 105,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius: 10,
    borderWidth:1
    
  },
  image: {
    
    width: '100%',
    height: '100%',
    resizeMode: 'cover', 
    borderRadius: 10, 
    backgroundColor:'grey'
  },
  imageName: {
    marginTop: 10,
    color: colors.dark,
    fontSize: 16,
    textAlign: 'center', 
  },
});

export default Images;
