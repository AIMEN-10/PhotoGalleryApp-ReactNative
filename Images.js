import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from './theme/colors';
import Allcontrols from './Allcontrols';

const Images = ({ route, navigation }) => {
  const { data } = route.params || {};  // Get folder data passed from the previous screen

  // Handle image press (you can replace this with your actual navigation or action)
  const handleImagePress = (item) => {
    console.log("Navigating to ViewPhoto with item:", item);
    navigation.navigate("ViewPhoto", { item }); // Pass 'item' properly to the next screen
  };

  return (
    <View style={styles.container}>
      <View style={styles.allControlsContainer}>
        {/* Allcontrols Component */}
        <Allcontrols text={data} />
      </View>

      <View style={styles.contentContainer}>
        {/* Image Container with Pressable */}
        <Pressable
          style={styles.imageContainer}
          onPress={() => handleImagePress("item")} // Adjust to use the correct image data
        >
          <Image
            source={require("./asset/1.jpeg")}
            style={styles.image}
          />
        </Pressable>

        
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
    position:'absolute',
    top: 0,
        left: 0,
        right: 0,// Adjusts spacing between controls and the image container
  },
  contentContainer: {
     flex: 1, 
    marginTop:80,
    padding:10,
  },
  imageContainer: {
    position:'relative',
    width: 100,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: 'grey',
    overflow: 'hidden', // Ensures rounded corners for image inside container
    backgroundColor:'red'
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
