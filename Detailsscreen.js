import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, SafeAreaView, StyleSheet, FlatList, ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { getImageDetails, getLocationById, getEventsByImageId } from './Databasequeries'; // Adjust import based on your file structure
import colors from './theme/colors';

const Detailsscreen = (props) => {
  const { imageId } = props;
  console.log('Image ID:', imageId);
  
  const [imagedata, setimagedata] = useState(null); // Start with null to check for empty data
  const [imageDetails, setData] = useState(null);
  const [hasPerson, setHasPerson] = useState(false);
  const [locationname, setlocationname] = useState(null);
  const [events, SetEvents] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (imageId) {
          const imageDet = await getImageDetails(imageId);
          setimagedata(imageDet);
          setData(imageDet?.persons); // Use optional chaining to handle empty data gracefully
          console.log('Fetched image details:', imageDet); // Log the fetched data

          if (imageDet) {
            if (Array.isArray(imageDet.persons) && imageDet.persons.length > 0) {
              setHasPerson(true);
            } else {
              console.log("❌ No persons found in the image.");
            }
          } else {
            console.log('No image details found for this ID!');
          }

          try {
            if (imageDet?.location_id) {
              console.log('Location ID:', imageDet.location_id); // Log the location ID
              getLocationById(imageDet.location_id)
                .then(locationName => {
                  console.log('Location name:', locationName);
                  setlocationname(locationName); // Set the location name in state
                })
                .catch(error => {
                  console.log('Error:', error);  // Should log "Location not found" if there's an issue
                });
            }
          } catch {
            console.log('Error fetching location name'); // Log if there's an error fetching the location name
          }

          try {
            if (imageDet?.image_id) {
              getEventsByImageId(imageDet.image_id)
                .then(eventNames => {
                  if (Array.isArray(eventNames) && eventNames.length > 0) {
                    console.log('Fetched event names:', eventNames);

                    // Normalize to string array in case it's array of objects
                    const eventNameStrings = eventNames.map(name =>
                      typeof name === 'string' ? name : name?.event_name || ''
                    ).filter(Boolean); // Remove empty strings

                    SetEvents(eventNameStrings);
                  } else {
                    console.log('No events found for image:', imageDet.image_id);
                    SetEvents([]); // Set to empty array safely
                  }
                })
                .catch(error => {
                  console.log('Error:', error);
                  SetEvents([]); // Prevent crash on error
                });
            }
          } catch (error) {
            console.log('Error fetching events name', error); // Log if there's an error fetching the location name
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchEvents(); // Fetch events when the modal is visible
  }, [imageId]);

  // Check if there's no data
  const renderNoData = () => (
    <View style={{ alignItems: 'center', marginTop: 20 }}>
      <Text style={styles.label}>No data available</Text>
    </View>
  );

  return (
    <SafeAreaView>
      <View style={{ padding: 15 }}>
        {imagedata ? (
          <>
            {hasPerson ? (
              <View>
                <View style={{ position: 'relative', left: '20%' }}>
                  <Image
                    source={{ uri: baseUrl + imageDetails[0]?.person_path }}
                    style={{ height: 60, width: "20%" }}
                  />
                </View>

                <View style={styles.nameContainer}>
                  <Text style={styles.label}>Name: {imageDetails[0]?.person_name}</Text>

                  <Text
                    style={styles.label}
                    onPress={() =>
                      navigation.navigate('PersonInfo', {
                        imageDetails, screen: 'Details',
                      })
                    }
                  >
                    More...
                  </Text>
                </View>
              </View>
            ) : (
              renderNoData() // If no person details found, show "No data"
            )}

            <Text style={styles.label}>Event</Text>

            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, width: '100%' }}>
                {/* Render events or show no events */}
                {events.length > 0 ? (
                  events.map((item, index) => (
                    <View key={index} style={styles.eventItem}>
                      <Text style={styles.eventText}>• {item}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.eventText}>No events available</Text> // Show if no events
                )}
              </View>
            </View>

            <Text style={styles.label}>Event Date</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
              <Text style={{ fontSize: 18, color: colors.dark }}>
                {imagedata?.event_date || 'No date available'}
              </Text>
            </View>

            <View style={styles.nameContainer}>
              <Text style={styles.label}>Location: {locationname || 'Location not found'}</Text>
            </View>
          </>
        ) : (
          renderNoData() // Show empty state if image data is not loaded
        )}
      </View>
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
  labels: {
    color: colors.dark,
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  eventItem: {
    paddingVertical: 4,
  },
  eventText: {
    fontSize: 16,
    color: colors.dark,
  },
});

export default Detailsscreen;
