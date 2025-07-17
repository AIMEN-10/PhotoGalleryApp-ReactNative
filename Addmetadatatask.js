import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Allcontrols from './Allcontrols'; 
import Cameranavbar from './Cameranavbar';
import TaskFolders from './TaskFolders';
import Images from './Images';
//import Bottomnavigation from './Bottomnavigation';
import colors from './theme/colors';

const Addmetadatatask = ({ route }) => {
  const { data } = route.params || {}; 
  console.log(data)
  if (data=='Label')
  {
<Images route={{ params: { data } }}/>
// console.log(data)
  }
    return (
      <View style={styles.container}>
        <View style={styles.allControlsContainer}>
        <Allcontrols text={data}/>
        </View>
      
      <View style={styles.imagesContainer}>

      {data === 'Label'? (
       
          <Images route={{ params: { data } }}/>
           
       
      ):(

<TaskFolders route={{ params: { data } }} />
      )}

      
      </View>
      
      {/* <View style={styles.cameraNavbarContainer}>
        <Cameranavbar />
      </View> */}

       </View>
      );
    };
    const styles = StyleSheet.create({
      container: {
         flex: 1,
       
      },
      imagesContainer: {
        flex:1,
        marginBottom: 0, 
        
      },
      
      cameraNavbarContainer: {
        position: 'absolute',  
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,  
        
      },
      allControlsContainer: {
        position: 'absolute',  
        top: 0,
        left: 0,
        right: 0,
        
      },
      
     
    });

export default Addmetadatatask;