import React, { useState } from 'react';
import { View, Image, Text, Alert, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper'; 
import * as ImagePicker from 'react-native-image-picker';
import moment from 'moment';
import colors from './theme/colors';

const Cameranavbar = () => {
  const [myImage, setMyImage] = useState(null);
  
  const pickImage = () => {
    ImagePicker.launchCamera({ mediaType: 'photo' }, response => {
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
  return (
    <View style={styles.container}>
      {/* <Image
        source={myImage ? { uri: myImage } : null}
        style={styles.image}
      /> */}
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
  }
  
});

export default Cameranavbar;
