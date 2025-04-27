import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Pressable, PermissionsAndroid, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from './theme/colors';
import Allcontrols from './Allcontrols';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewPhoto from './ViewPhoto';
import Databasequeries from './Databasequeries';
import { FlatList } from 'react-native-gesture-handler';
import ImageData from './ViewModels/ImageData';
import Filteredimages from './ViewModels/Filteredimages';



const Images = ({ route }) => {
  const { data } = route.params || {};
  const parts = data.split(';');

  const navigation = useNavigation();
  
  const [photos, setPhotos] = useState([]); // Initialize photos state
  const { photos: fetchedPhotosFromHook } = ImageData();
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!data) {
          console.log('No data provided.');
          return;
        }

        if (data === 'Label') {
          
          setPhotos(fetchedPhotosFromHook); 
          console.log('Label data:', {photos}); 
        } else {
          const fetchedPhotos = await Filteredimages(data);  
          setPhotos(fetchedPhotos);  
        }
      } catch (error) {
        console.error('Error loading photos:', error);
      }
    };

    loadData(); 
  }, [data]); 


  const handleImagePress = (item) => {
    navigation.navigate("ViewPhoto", { item: item, data: data });
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.container}>
        <View style={styles.allControlsContainer}>
        <Allcontrols text={parts[2] || 'Label'} />

        </View>
        <View style={styles.gridContainer}>

          {photos.length > 0 ? (
            <FlatList
              data={photos}
              keyExtractor={(item, index) => index.toString()}
              numColumns={3}
              scrollEnabled={true}

              columnWrapperStyle={{
                marginRight: 10,
                justifyContent: 'space-between',
                flexWrap: 'wrap',
              }}


              renderItem={({ item }) => (
                
                <Pressable
                  style={styles.imageContainer}
                  onPress={() => handleImagePress(item)}
                >
                  <Image
                    //source={{ uri: item.node.image.uri}}
                    source={{ uri: item.path}}
                    style={styles.image}
                  />
                </Pressable>
              )}
            />
          ) : (
            <Text style={styles.noImagesText}>No images found</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
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
    paddingTop: 100
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
