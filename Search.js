import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Pressable,TextInput } from 'react-native';
import { useNavigation ,Chip} from '@react-navigation/native';
import colors from './theme/colors';
import Allcontrols from './Allcontrols';

const Search = ({route}) => {
   const { data } = route.params || {}; 
   const [name, setName] = useState('');
   
  return (
   <View>
    <View style={styles.allControlsContainer}>
    <Allcontrols text={data}></Allcontrols>
    </View>
    <View style={styles.contentContainer}>
      
        <View style={styles.nameContainer}>
        <Text style={styles.text}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={(text) => setName(text)} // Update state on text change
          placeholder="Enter name"
          placeholderTextColor={colors.dark} 
        />
        </View>
    </View>
    {/* <Chip
        icon="information"
        onPress={() => console.log('Pressed')}
        style={styles.chip}
      >Example Chip</Chip> */}
   </View>
  );
};

const styles = StyleSheet.create({
  text:{
    color:colors.dark,
    fontSize:20
  },
  allControlsContainer: {
    position:'absolute',
    top: 0,
        left: 0,
        right: 0,// Adjusts spacing between controls and the image container
  },
  contentContainer: {
    // flex: 1, 
    marginTop:80,
    padding:10,
  },
  nameContainer: {
    flexDirection: 'row', // To display the label and input next to each other
    alignItems: 'center', // Vertically align the text and input
    marginVertical: 20, // Space between sections
  },
  input: {
    borderBottomWidth: 1, // Creates the underline
    borderBottomColor: colors.dark, // Set the color for the underline
    paddingVertical: 5, // Vertical padding for the input field
    flex: 1, // Take the remaining space for the input
    fontSize: 16, // Adjust font size for input text
    color:colors.dark
  },
  chip: {
    marginTop: 20, // Space above the chip
    backgroundColor: colors.primary, // Background color for the chip
    paddingHorizontal: 15, // Horizontal padding for the chip
  },
});

export default Search;
