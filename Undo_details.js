import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, SafeAreaView, StyleSheet, ScrollView,
} from 'react-native';
import colors from './theme/colors';
import { getImageDetailsUndo } from './Databasequeries'; // cleaned unused imports
import { useNavigation, useRoute } from '@react-navigation/native';


const Undo_details = () => {
  const route = useRoute();
  const { imageId, version } = route.params;
console.log('Image ID:', imageId, 'Version:', version);
  const [imageDetails, setImageDetails] = useState(null);
  const [hasPerson, setHasPerson] = useState(false);
  const navigation = useNavigation();
const[Allperson,setAllperson]=useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!imageId || !version) return;

        const imageDataMap = await getImageDetailsUndo(imageId, version);
        console.log('Fetched image data:', imageDataMap);

        const imageData = imageDataMap?.[imageId.toString()];
        if (!imageData) return;
setAllperson(imageData.persons_id || []);

        setImageDetails(imageData);
        setHasPerson(Array.isArray(imageData.persons_id) && imageData.persons_id.length > 0);
      } catch (err) {
        console.error('Error fetching undo details:', err);
      }
    };

    fetchData();
  }, [imageId, version]);

  const renderNoData = () => (
    <View style={{ alignItems: 'center', marginTop: 20 }}>
      <Text style={styles.label}>No data available</Text>
    </View>
  );

  if (!imageDetails) return renderNoData();

  const person = imageDetails.persons_id?.[0];

  return (
    <SafeAreaView>
      <ScrollView style={{ padding: 15 }}>
        {hasPerson ? (
          <View>
            <View style={{ alignItems: 'center' }}>
              <Image
                source={{ uri: baseUrl + person?.person_path }}
                style={{ height: 80, width: 80, borderRadius: 40 }}
              />
            </View>

            <View style={styles.nameContainer}>
              <Text style={styles.label}>Name: {person?.person_name}</Text>
              <Text
                style={[styles.label, { color: 'blue' }]}
                onPress={() =>
                  navigation.navigate('PersonInfo', {
                    imageDetails: Allperson,
                    screen: 'Details',
                  })
                }
              >
                More...
              </Text>
            </View>
          </View>
        ) : (
          renderNoData()
        )}

        <Text style={styles.label}>Event</Text>
        {Array.isArray(imageDetails.event_names) && imageDetails.event_names.length > 0 ? (
          imageDetails.event_names.map((item, index) => (
            <View key={index} style={styles.eventItem}>
              <Text style={styles.eventText}>• {item}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.eventText}>No events available</Text>
        )}

        <Text style={styles.label}>Event Date</Text>
        <Text style={styles.eventText}>
          {imageDetails?.event_date || 'No date available'}
        </Text>

        <View style={styles.nameContainer}>
         <Text style={styles.label}>
  Location: {imageDetails?.location || 'Location not found'}
</Text>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    gap: 100,
  },
  label: {
    color: colors.dark,
    fontSize: 18,
    marginBottom: 5,
  },
  eventItem: {
    paddingVertical: 4,
  },
  eventText: {
    fontSize: 16,
    color: colors.dark,
  },
});

export default Undo_details;
