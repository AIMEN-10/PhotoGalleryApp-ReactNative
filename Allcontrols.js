import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconButton, MD3Colors } from 'react-native-paper';
import colors from './theme/colors';

const Allcontrols = ({ text }) => {
  

   
  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <View style={{ margin: 5 }}>
        <Text style={styles.heading}>{text}</Text>
        <View style={[styles.circle, { backgroundColor: colors.secondary }]}>
        
        
      </View>
       
        
      </View>
    </View>
  );
};

    const styles = StyleSheet.create({
    
heading:{
    fontSize:25,
    margin:10,
    paddingLeft: 20,
    color:colors.dark
},
circle:{
  bordercolor:colors.dark,
  borderWidth: 1,
    borderRadius:50,
    height:700,

}
    });

export default Allcontrols;
