import React, { useEffect, useState} from 'react';
import { View, StyleSheet, Image, ScrollView ,Text} from 'react-native';
import { Button } from 'react-native-paper';
import colors from './theme/colors';
import Allcontrols from './Allcontrols';
import { getLatestImageVersions,getImageDetailsUndo,reactivateUndoHistory,editDataForMultipleIds} from './Databasequeries'; // Adjust the import path as necessary
import { useNavigation, useRoute } from '@react-navigation/native';


const Undo = ({ route }) => {
  const [imageList, setImageList] = useState([]);
  const navigation = useNavigation();
  useEffect(() => {
   const a=getLatestImageVersions().then((data) => {
      setImageList(data);
    });
  }, []);


  const undoImageEdit = async (imageId, version) => {
  const imageData = await getImageDetailsUndo(imageId, version);

  if (!imageData) {
    console.error('No image data found');
    return;
  }

  const data = imageData[String(imageId)];

  

  const selectedEvents = data.event_names;  // assuming these are event names
  const eventDate = data.event_date;
  const location = data.location; // array like: [name, lat, long]
  const last_modified = data.last_modified;

  await editDataForMultipleIds(imageId, data.persons, selectedEvents, eventDate, location, last_modified);

  
    const success = await reactivateUndoHistory(imageId, version, data.capture_date, data.last_modified);

  return success;
};

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.allControlsContainer}>
        <Allcontrols text="Undo Changes" />
      </View>

      <View style={styles.buttonWrapper}>
        <Button
          mode='contained'
          style={styles.button}
          labelStyle={styles.buttonText}
          onPress={() => {
  imageList.forEach(async (img) => {
    const success = await undoImageEdit(img.id, img.version_no);
    if (success) {
      console.log(`✅ Undo done for ${img.id}`);
    }
  });
}}

        >
          Undo All
        </Button>
      </View>

      <ScrollView contentContainerStyle={styles.cardContainer}>
        {imageList.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20 ,color:colors.dark}}>No history found.</Text>
        ) : (
          imageList.map((img, index) => (
            <View key={index} style={styles.card}>
              <Image
                source={{ uri: img.path }}
                style={styles.image}
              />
              <View style={styles.cardButtons}>
                <Button
                  mode="outlined"
                  style={styles.actionButton}
                  labelStyle={styles.actionButtonText}
                    onPress={() => navigation.navigate('Undo_details', { imageId: img.id,version: img.version_no })} // Adjust navigation as needed

                >
                  View
                </Button>
                <Button
                  mode="outlined"
                  style={styles.actionButton}
                  labelStyle={styles.actionButtonText}
onPress={() => {
  undoImageEdit(img.id, img.version_no).then((success) => {
    if (success) {
      console.log(`✅ Undo successful for image ${img.id}`);
      // Optionally update UI or show a Snackbar
    } else {
      console.error(`❌ Undo failed for image ${img.id}`);
    }
  });
}}

                >
                  Undo
                </Button>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  allControlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  buttonWrapper: {
    marginTop: 100,
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.primary,
    borderColor: colors.dark,
    borderWidth: 1,
    width: 160,
  },
  buttonText: {
    color: colors.dark,
  },
  cardContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderColor: colors.dark,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 16,
  },
  cardButtons: {
    flexDirection: 'column',
    gap: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  actionButtonText: {
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Undo;
