import React from 'react';
import { View, Image, StyleSheet, SafeAreaView ,Text, ScrollView} from 'react-native';
import Editnavbar from './Editnavbar';
import Allcontrols from './Allcontrols';

const ViewPhoto = ({ route ,navigation}) => {
  // const { item,image } = route.params;

  // Get the `path` from `item`
  // const { path } = item;
  // console.log(path);
  // const imageUrl = baseUrl + item.path.replace('~', '');

  return (
    
      <SafeAreaView style={styles.container}>
       {/* <ScrollView contentContainerStyle={styles.scrollViewContainer}> */}
       <View style={styles.allControlsContainer}>
        {/* Allcontrols Component */}
        <Allcontrols text="Sir Afrasiab" />
      </View>
        <View style={styles.imageContainer}>
          {/* <Image source={{ uri: imageUrl }} style={styles.image} /> */}
           <Image
                      source={require("./asset/7.jpeg")}
                      style={styles.image}
                    />
        </View>

        {/* </ScrollView> */}
        {/* <View style={styles.navbarContainer}> */}
       
          <Editnavbar />
        {/* </View> */}
      </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContainer: {
    flexGrow: 1,  // Allow ScrollView to take up the entire space
    justifyContent: 'center',  // Center the content vertically
    alignItems: 'center',  // Center content horizontally
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,  // Adding margin at the bottom of the image
  },
  image: {
    width: '100%',
    height: 700,  // You can adjust based on your design
    resizeMode: 'contain',
    
  },
  allControlsContainer: {
    position: 'absolute',  // This makes the navbar float above other elements
    top: 0,
    left: 0,
    right: 0,
    //zIndex: 999,// This pushes AllControls down so they don't overlap with the navbar
  },
});

export default ViewPhoto;
