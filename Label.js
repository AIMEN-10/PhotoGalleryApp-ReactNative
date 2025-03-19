import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Label = () => {
  return (
    <View style={styles.container}>
      <Text>abc</Text>
      <View style={styles.screen}>
        <Text style={styles.text}>hello</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor:'white'  
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'pink', 
    marginTop:200,
    height: 50, 
    width: 200, 
  },
  text: {
    color: 'white', 
    fontSize: 18,
  },
});

export default Label;
