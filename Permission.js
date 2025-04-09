import { PermissionsAndroid, Platform } from 'react-native';

const requestStoragePermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES || PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Gallery Access Needed',
          message: 'We need access to your photos to display them.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};


//Load Images
import { useEffect, useState } from 'react';
import { View, Image, FlatList, Dimensions } from 'react-native';
import CameraRoll from '@react-native-camera-roll/camera-roll';

const ImageGallery = () => {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const loadPhotos = async () => {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) return;

      try {
        const res = await CameraRoll.getPhotos({
          first: 100, // Change this to however many you want
          assetType: 'Photos',
        });

        setPhotos(res.edges.map(edge => edge.node.image.uri));
      } catch (error) {
        console.log('Failed to load images:', error);
      }
    };

    loadPhotos();
  }, []);

  const renderItem = ({ item }) => (
    <Image
      source={{ uri: item }}
      style={{
        width: Dimensions.get('window').width / 3,
        height: Dimensions.get('window').width / 3,
      }}
    />
  );

  return (
    <FlatList
      data={photos}
      numColumns={3}
      keyExtractor={(item, index) => item + index}
      renderItem={renderItem}
    />
  );
};

export default ImageGallery;

