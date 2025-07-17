import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { Alert } from 'react-native';
import { getAllImageData } from '../Databasequeries'; // Assume you can fetch all images from DB

const copyContentUriToFile = async (contentUri, index) => {
  try {
    const destPath = `${RNFS.CachesDirectoryPath}/shared-image-${index}.jpg`;

    // Decode URI if necessary
    const uri = decodeURIComponent(contentUri);

    // Ensure the URI starts with 'file://' or is valid
    const validUri = uri.startsWith('file://') ? uri : `file://${uri}`;

    // Copy file to cache
    await RNFS.copyFile(validUri, destPath);
    return `file://${destPath}`;
  } catch (error) {
    console.error('Failed to copy content URI:', error);
    return null;
  }
};

const handleShare = async (selectedItems = []) => {
  try {
    if (!selectedItems.length) {
      Alert.alert('No images selected');
      return;
    }

 const allImages = await new Promise((resolve, reject) => {
      getAllImageData((data) => {
        if (data) {
          resolve(data);
        } else {
          reject(new Error('Failed to fetch images'));
        }
      });
    });    console.log(allImages);
    const selectedImages = allImages.filter(img => selectedItems.includes(img.id));

    const fileUris = await Promise.all(
      selectedImages.map((item, index) =>
        copyContentUriToFile(item.path, index)
      )
    );

    const validUris = fileUris.filter(Boolean);
    if (!validUris.length) {
      Alert.alert('Nothing to share', 'No valid images were found.');
      return;
    }

    await Share.open({
      title: 'Share Images',
      urls: validUris,
      social: Share.Social.WHATSAPP,
      failOnCancel: false,
    });
  } catch (error) {
    console.error('Error sharing images:', error);
    Alert.alert('Share failed', error.message);
  }
};

export { handleShare };
