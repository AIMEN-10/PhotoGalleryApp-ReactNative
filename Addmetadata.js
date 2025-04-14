import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Allcontrols from './Allcontrols'; 
import Cameranavbar from './Cameranavbar';
import Folders from './Folders';
import Images from './Images';
//import Bottomnavigation from './Bottomnavigation';
import colors from './theme/colors';

const Addmetadata = ({ route }) => {
  const { data } = route.params || {}; 
  console.log(data)
  if (data=='Label')
  {
<Images/>

  }
    return (
      <View>
        <View style={styles.allControlsContainer}>
        <Allcontrols text={data}/>
        </View>
      
      <View style={styles.imagescontainer}>

      {data === 'Label'? (
        <View>
          <Images route={{ params: { data } }}/>
           
        </View>
      ):(

<Folders route={{ params: { data } }} />
      )}

      
      </View>
      
      <View style={styles.cameraNavbarContainer}>
        <Cameranavbar />
      </View>

       </View>
      );
    };
    const styles = StyleSheet.create({
      container: {
        // flex: 1,
        // paddingTop: 50, // Adjust if needed for padding on top
      },
      imagescontainer:{
position:'relative'
      },
      cameraNavbarContainer: {
        position: 'absolute',  // This makes the navbar float above other elements
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,  // Very high zIndex to make sure it's in the foreground
        //backgroundColor: 'rgba(255, 255, 255, 0.8)',  // Optional: slightly transparent background to make it stand out
      },
      allControlsContainer: {
        position: 'absolute',  // This makes the navbar float above other elements
        top: 0,
        left: 0,
        right: 0,
        //zIndex: 999,// This pushes AllControls down so they don't overlap with the navbar
      },
     
    });

export default Addmetadata;