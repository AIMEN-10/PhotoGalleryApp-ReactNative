import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from './theme/colors';
import Allcontrols from './Allcontrols';

const Search = ({ navigation }) => {
//   const { data } = route.params || {};  // Get folder data passed from the previous screen

  // Handle image press (you can replace this with your actual navigation or action)
  const handleImagePress = (item) => {
    console.log("done");
    // navigation.navigate("ViewPhoto", { item }); // Pass 'item' properly to the next screen
  };

  return (
    <View style={styles.container}>
      <View style={styles.allControlsContainer}>
        {/* Allcontrols Component */}
        <Allcontrols text={data} />
      </View>

      <View style={styles.contentContainer}>
        

        
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
  
  
});

export default Search;
