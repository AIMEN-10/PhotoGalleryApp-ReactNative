import React, { useEffect, useState } from 'react';
import {
    View, Text, Image, SafeAreaView, StyleSheet, FlatList, ScrollView,
} from 'react-native';
import { getImageDetails, getLocationById, getEventsByImageId } from './Databasequeries'; // Adjust import based on your file structure
import colors from './theme/colors';

const Detailsscreen = (props) => {
    const { imageId } = props;
    console.log('Image ID:', imageId);
    const [imageDetails, setImageDetails] = useState([]);
    const [imagedata, setimagedata] = useState([]);
    const [data, setData] = useState(null);
    const [hasPerson, setHasPerson] = useState(false);
    const [locationname, setlocationname] = useState(null);
    const [events, SetEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                if (imageId) {
                    const imageDet = await getImageDetails(imageId);
                    setimagedata(imageDet);
                    setData(imageDet.persons);
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
                        console.log('Location ID:', imageDet.location_id); // Log the location ID
                        getLocationById(imageDet.location_id)
                            .then(locationName => {
                                console.log('Location name:', locationName);
                                setlocationname(locationName); // Set the location name in state
                            })
                            .catch(error => {
                                console.log('Error:', error);  // Should log "Location not found" if there's an issue
                            });
                    } catch {
                        console.log('Error fetching location name'); // Log if there's an error fetching the location name
                    }

                    try {
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

                    } catch (error) {
                        console.log('Error fetching events name', error); // Log if there's an error fetching the location name
                    }
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        }

        fetchEvents(); // Fetch events when the modal is visible
    }, [imageId])

    return (
        <SafeAreaView >

            <View >
                {hasPerson && (
                    <View>
                        <View style={{ position: 'relative', left: '20%' }}>
                            <Image
                                source={{ uri: baseUrl + data[0].person_path }}
                                style={{ height: 60, width: "20%" }}
                            />
                        </View>

                        <View style={styles.nameContainer}>
                            <Text style={styles.label}>Name : {data[0].person_name}</Text>

                            <Text
                                style={styles.label}
                                onPress={() =>
                                    navigation.navigate('PersonInfo', {
                                        imageDetails
                                    })
                                }
                            >
                                More...
                            </Text>
                        </View>
                    </View>
                )}

                <Text style={styles.label}>Event</Text>

                <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1, width: '100%' }}>
                        {/* <Text style={styles.labels}>Events</Text> */}
                        <View>
                            {events.map((item, index) => (
                                <View key={index} style={styles.eventItem}>
                                    <Text style={styles.eventText}>• {item}</Text>
                                </View>
                            ))}
                        </View>


                    </View>
                </View>

                <Text style={styles.label}>Event Date</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                    <Text style={{ fontSize: 18, color: colors.dark }}>
                        {imagedata.event_date}
                    </Text>
                </View>

                <View style={styles.nameContainer}>
                    <Text style={styles.label}>Location : {locationname}</Text>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 15,
        gap: 100
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
