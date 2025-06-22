
import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Pressable, PermissionsAndroid, Platform, Alert } from 'react-native';
import { requestMediaLibraryPermission } from '../Permission';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { getAllImages, InsertImageData, DeletetAllData, insertPerson, linkImageToPerson, checkIfHashExists, resetImageTable } from '../Databasequeries';
import AsyncStorage from '@react-native-async-storage/async-storage';


const ImageData = () => {

  const [photos, setPhotos] = useState([]);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadImages = async () => {
    return new Promise((resolve) => {
      getAllImages((data) => {
        const paths = data.map(item => ({
          id: item.id,
          path: item.path
        }));
        setPhotos(paths);
        resolve(paths); // <- return the updated list
      });
    });
  };

  useEffect(() => {
    const init = async () => {
      const hasPermission = await requestMediaLibraryPermission();
      if (hasPermission) {
        //await DeletetAllData();
        //await getAllPhotos();


        // getAllImages((data) => {
        //   const paths = data.map(item => ({
        //     id: item.id,    // Accessing the 'id' from the item
        //     path: item.path // Accessing the 'path' from the item
        //   }));

        //   setPhotos(paths); // Set the photos state with the array of objects
        // });
        await loadImages();




      } else {
        console.warn('Permission not granted');
        Alert.alert('Permission not granted', 'Please enable permission to access photos in settings.');
      }
    };

    init();
  }, []);



  //extract faces
  const sendImage = async (image) => {
    const { uri } = image;
    const fileName = uri.split('/').pop();  // Get the filename from the uri

    // MIME type detection
    const getMimeType = (fileName) => {
      const extension = fileName.split('.').pop().toLowerCase();
      const mimeMap = {
        jpg: 'image/jpg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        gif: 'image/gif',
      };
      return mimeMap[extension] || 'application/octet-stream';
    };

    const mimeType = getMimeType(fileName);

    const formData = new FormData();
    formData.append('file', {
      uri,
      name: fileName,  // Use the file name
      type: mimeType,   // Adjust MIME type accordingly
    });

    try {
      // Replace `baseUrl` with your server URL
      const response = await fetch(`${baseUrl}image_processing`, {
        method: 'POST',
        body: formData,
        // headers: {
        //   'Content-Type': 'multipart/form-data', // Important for form-data uploads
        // },
      });

      // Handle the server's response
      const result = await response.json();

      // Always return 'results' in a consistent format
      if (response.ok) {
        if (Array.isArray(result)) {
          // Faces found, returning detected faces
          return { results: result };
        } else if (result.message === 'No faces found') {
          // No faces found, return empty 'results' array
          return { results: [] };
        } else {
          // Unexpected response, still return an empty 'results' array
          console.warn('⚠️ Unexpected server response:', result);
          return { results: [] };
        }
      } else {
        // Error occurred on the server side
        const errorMsg = result?.error || 'Unknown error';
        console.error('❌ Error extracting tags:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Upload failed:', error);
      throw error;
    }
  };


  const getAllPhotos = async () => {
    const resp = resetImageTable();
    try {
      const result = await CameraRoll.getPhotos({
        first: 7,
        assetType: 'Photos',
      });

      //setPhotos(result.edges);
      const alreadyFetched = await AsyncStorage.getItem('hasFetchedImages');

      if (alreadyFetched !== 'true') {
        // Fetch and save images ONLY ONCE

        // Insert images into DB
        const insertPromises = result.edges.map(async edge => {
          const { uri, timestamp } = edge.node.image;
          const captureDate = formatDate(new Date()); // Format the timestamp to YYYY-MM-DD
          const hash = generateHash(uri);
          const exists = await checkIfHashExists(hash);
          if (exists) {
            console.log('🔁 Duplicate image skipped (hash already exists):', hash);
            return;
          }
          else {
            const imageId = await InsertImageData({
              path: uri,
              capture_date: captureDate,
              last_modified: captureDate,
              hash: hash,
            });


            const result = await sendImage(edge.node.image); // Send image to server
            if (result.message != "No faces found") {
              // console.log('Image sent successfully:', result);

              if (result.results.length > 0) {
                // console.log('✅ Faces found:', result.results);

                // Loop through detected faces and insert each person into the database
                for (const person of result.results) {
                  try {
                    const personId = await insertPerson({
                      name: person.name,
                      path: person.path,
                      gender: person.gender,
                    });

                    console.log('Person inserted with ID:', personId);
                    if (personId) {
                      await linkImageToPerson({
                        imageId: imageId,
                        personId: personId,
                      });
                      console.log('Image linked to person successfully:', personId, imageId);
                    }
                    // You can now use personId for further operations, e.g., tagging or linking the image
                  } catch (error) {
                    console.log('❌ Error inserting person:', error);
                  }
                }
              } else {
                console.log('🚫 No faces found in image.');
              }

            }
          }

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

  return { photos };

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