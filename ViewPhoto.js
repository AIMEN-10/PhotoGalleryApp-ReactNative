import React from 'react';
import { View, Image, StyleSheet, SafeAreaView, Text, ScrollView ,Dimensions} from 'react-native';
import Editnavbar from './Editnavbar';
import Allcontrols from './Allcontrols';
const { width, height } = Dimensions.get('window');
const ViewPhoto = ({ route, navigation }) => {
   const { item,data } = route.params;
   const parts = data.split(';');
   // Get the `path` from `item`
  // const { path } = item;
 // console.log("View photo",item);
  // const imageUrl = baseUrl + item.path.replace('~', '');
  

  return (

    <SafeAreaView >

      <View style={styles.allControlsContainer}>

        <Allcontrols text={parts[2] || 'Unknown'} />
      </View>
      <View style={styles.imageContainer}>
        {/* <Image source={{ uri: imageUrl }} style={styles.image} /> */}
         <Image
           source={{ uri: item.path }}
          // source={require('.//asset//22.jpeg')}
          style={styles.image}
        />
      </View>

      <Editnavbar imageId={item.id}/>

    </SafeAreaView>

  );
};

const styles = StyleSheet.create({

  scrollViewContainer: {
    flexGrow: 1,  // Allow ScrollView to take up the entire space
    justifyContent: 'center',  // Center the content vertically
    alignItems: 'center',  // Center content horizontally
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    //marginTop: 50,
    paddingHorizontal: 20,
    marginBottom: 20,  // Adding margin at the bottom of the image
    //backgroundColor:'red'
  },
  image: {
    width: width,
    height: height*0.97,
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
