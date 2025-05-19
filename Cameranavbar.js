import React, { useState } from 'react';
import { View, Image, Text, Alert, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper'; 
import * as RNImagePicker from 'react-native-image-picker';
import ImagePicker from 'react-native-image-crop-picker';
import { getAllImageData, InsertImageData, DeletetAllData, insertPerson, linkImageToPerson, checkIfHashExists ,resetImageTable} from './Databasequeries';

import moment from 'moment';
import colors from './theme/colors';

const Cameranavbar = () => {
  const [myImage, setMyImage] = useState(null);
  let imageID;
   const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  

  const pickImage = () => {
    RNImagePicker.launchCamera({ mediaType: 'photo' }, response => {
        if (response.assets) {
          const imageUri = response.assets[0].uri;
          setMyImage(imageUri);
            handleSave(myImage);

        }
        else{
          console.log("error capturing image")
        }
    });
};
const handleSave = async (image) => {
  if (myImage ) {
    console.log('myImage:', myImage);  // Log the whole myImage object to verify structure
    //console.log('Image URI:', myImage.uri);  // Log the URI separately
  
    const formData = new FormData();
    
    // Extract file extension from URI to determine MIME type
    const fileExtension = myImage.split('.').pop();  // Extract file extension
    const mimeType = fileExtension === 'jpg' || fileExtension === 'jpeg' ? 'image/jpeg' : 'image/png';
    

    
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const date = moment()
  .utcOffset('+05:30') // Adjust to your time zone
  .format('YYYY-MM-DD_hh-mm-ss_a');
    dateString=`${month}/${date}/${year}`;
    // Use formatted date in a filename
    const defaultFileName = `image_${date}.jpg`;
    console.log('FormData:', defaultFileName);  // Log FormData to ensure it's populated
    // Append image with URI, MIME type, and default name
    formData.append('Files', {
      uri: myImage,  // Local URI (file://path)
      type: mimeType,     // MIME type (e.g., image/jpeg)
      name: defaultFileName,  // Default name for the file
    });
    
    
    // Now send the request
    try {
      const url = baseUrl+'api/Image/insertImage';
      
      const res = await fetch(url, {
        method: 'POST',
        body: formData,  // Send FormData with image
      });
  
      if (!res.ok) {
        const errorDetails = await res.text();
        console.error('Request failed with status:', res.status, errorDetails);
      } else {
        const responseData = await res.json();
        console.log('Data saved successfully:', responseData);
      }
    } catch (error) {
      console.error('Error during fetch:', error);
    }
  } else {
    console.error('Invalid myImage object or missing URI');
  }
  
};
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
          console.log('Faces found:', result);
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
const pickImagefromgallery = async () => {
  try {
    const selected = await ImagePicker.openPicker({
      multiple: true,
      mediaType: 'photo',
    });

    // Safety check: User cancelled or something went wrong
    if (!selected || (Array.isArray(selected) && selected.length === 0)) {
      console.log('🚫 No images selected or picker was cancelled.');
      return;
    }

    // Ensure we always work with an array
    const images = Array.isArray(selected) ? selected : [selected];

    for (const image of images) {
      const uri = image.path; // image.path from image-crop-picker
      const captureDate = formatDate(new Date());
      const hash = generateHash(uri);

      const exists = await checkIfHashExists(hash);
      if (exists) {
        console.log('🔁 Duplicate image skipped (hash already exists):', hash);
        continue;
      }

      // Insert image into DB
      const imageId = await InsertImageData({
        path: uri,
        capture_date: captureDate,
        last_modified: captureDate,
        hash: hash,
      });

      console.log('🖼️ Image inserted with ID:', imageId);

      // Send image to server for face recognition
      const result = await sendImage({ uri, ...image });

      if (result.results && result.results.length > 0) {
        for (const person of result.results) {
          try {
            // Ensure person object contains required fields
            const { name, path } = person;

            const personId = await insertPerson({
             person
            });

            console.log('👤 Person inserted with ID:', personId);

            if (personId) {
              await linkImageToPerson({
                imageId: imageId,
                personId: personId,
              });
              console.log('🔗 Image linked to person:', personId, imageId);
            }
          } catch (error) {
            console.log('❌ Error inserting person:', error);
          }
        }
      } else {
        console.log('🚫 No faces found in image.');
      }
    }

    console.log('✅ Finished processing selected images.');
  } catch (error) {
    console.error('❌ Error picking images from gallery:', error);
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
  return (
    <View style={styles.container}>
      {/* <Image
        source={myImage ? { uri: myImage } : null}
        style={styles.image}
      /> */}
      <IconButton
        icon="plus"
        iconColor="white"
        size={20}
        mode="contained"
        rippleColor={colors.primary}
        containerColor={colors.primary}
        onPress={pickImagefromgallery}  // Call pickImage when button is pressed
      style={styles.plusIcon}
      />
      <IconButton
        icon="camera"
        iconColor="white"
        size={40}
        mode="contained"
        rippleColor={colors.primary}
        containerColor={colors.primary}
        onPress={pickImage}  // Call pickImage when button is pressed
      style={styles.cameraIcon}
      />
     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    top: 200,
}
,
  image: {
    width: 150,
    height: 150,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 75,
  },
  text: {
    color: 'black',
    marginTop: 20,
  },
  cameraIcon:{
    position: 'absolute',
    bottom: -460,  // Adjust this value to move the icon higher or lower
    right: 4,
    borderWidth:0.5,
    borderColor:colors.dark,
  },
   plusIcon:{
    position: 'absolute',
    bottom: -400,  // Adjust this value to move the icon higher or lower
    right: 4,
    borderWidth:0.5,
    borderColor:colors.dark,
  }
  
});

export default Cameranavbar;
