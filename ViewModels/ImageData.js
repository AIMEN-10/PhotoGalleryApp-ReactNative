
import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Pressable, PermissionsAndroid, Platform,Alert } from 'react-native';
import { requestMediaLibraryPermission } from '../Permission';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import {getAllImageData, InsertImageData} from '../Databasequeries'; 
import AsyncStorage from '@react-native-async-storage/async-storage';


const ImageData=()=>{
    const [photos, setPhotos] = useState([]);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); 
      const day = String(date.getDate()).padStart(2, '0'); 
      return `${year}-${month}-${day}`;
    };
    

    
useEffect(() => {
    const init = async () => {
      const hasPermission = await requestMediaLibraryPermission();
      if (hasPermission) {

          await getAllPhotos(); 
      
         
        getAllImageData((data) => {
          console.log('\nFetched image data from DB:', data, '\n');

        });
        
      } else {
        console.warn('Permission not granted');
        Alert.alert('Permission not granted', 'Please enable permission to access photos in settings.');
      }
    };

    init();
  }, []);


  const getAllPhotos = async () => {
    try {
      const result = await CameraRoll.getPhotos({
        first: 5,
        assetType: 'Photos',
      });

      setPhotos(result.edges);
      const alreadyFetched = await AsyncStorage.getItem('hasFetchedImages');

      if (alreadyFetched !== 'true') {
        // Fetch and save images ONLY ONCE
      
      // Insert images into DB
      const insertPromises = result.edges.map(async edge => {
        const { uri, timestamp } = edge.node.image;
        const captureDate = formatDate(new Date()); // Format the timestamp to YYYY-MM-DD
        const hash = generateHash(uri); 

        await InsertImageData({
          path: uri,
          capture_date: captureDate,
          last_modified: captureDate,
          hash: hash,
        });
      });

      await Promise.all(insertPromises);

      await AsyncStorage.setItem('hasFetchedImages', 'true');
    }
    } catch (err) {
      console.error('Failed to load photos:', err);
    }
  };

  const generateHash = (uri) => {
    let hash = 0;
    for (let i = 0; i < uri.length; i++) {
      const char = uri.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash.toString();
  };

  return {
    photos,
  };
};

   // let hasNextPage = true;
    // let after = null;
    // let allPhotos = [];
  
    // try {
    //   while (hasNextPage) {
    //     const result = await CameraRoll.getPhotos({
    //       first: 100, // reasonable batch size
    //       assetType: 'Photos',
    //       after: after,
    //     });
  
    //     allPhotos = allPhotos.concat(result.edges);
    //     hasNextPage = result.page_info.has_next_page;
    //     after = result.page_info.end_cursor;
  
    //     // Optional: Break if too many
    //     if (allPhotos.length >= 1000) break; // Prevent overloading
    //   }
  
    //   setPhotos(allPhotos);
    // } catch (err) {
    //   console.error("Error fetching paginated photos:", err);
    // }
export default ImageData;
