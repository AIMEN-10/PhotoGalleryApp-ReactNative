import React from 'react';
import { View, StyleSheet, Image, Text ,Alert} from 'react-native';
import { Button } from 'react-native-paper';
import colors from './theme/colors';
import Allcontrols from './Allcontrols';
import { SvgXml } from 'react-native-svg';
import SyncLogo from './src/images/sync_logo.svg';
import { getAllSyncImages, getImageDetails, editDataForMultipleIds, checkIfHashExists,insertEvent,linkImageToPerson,insertPerson ,InsertImageData} from './Databasequeries';
import ImageResizer from 'react-native-image-resizer';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

import RNFS from 'react-native-fs'; // for local file handling
import { requestMediaLibraryPermission } from './Permission';

const Sync = ({ route }) => {
    const { data } = route.params || {};
    const senddata = async () => {
        try {
            const data = await getAllSyncImages();
            // console.log(data);
            const response = await fetch(`${baseUrl}get_unsync_images`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            console.log('API response:', result);

            for (const item of result) {
                const path = `${baseUrl}images/${item.path}`;
                console.log(path);

                const existingData = await checkIfHashExists(item.hash);

                if (existingData) {
                    const { id, last_modified_date } = existingData;
                    
                    if (last_modified_date < item.last_modified) {
                        const eventIds = [];

                        for (const eventName of item.events) {
                            try {
                                const result = await insertEvent(eventName.name); // returns { message, id }
                                if (result?.id != null) {
                                    eventIds.push(result.id);
                                }
                            } catch (error) {
                                console.error(`Error processing event "${eventName}":`, error);
                            }
                        }
                        // Use id in the edit function, or log last_modified_date if needed
                        await editDataForMultipleIds(
                            id,
                            item.persons,
                            eventIds,
                            item.eventDate,
                            item.location?.name ?? null,
                            item.currentDateFormatted

                        );

                        // Optionally use last_modified_date if needed
                        console.log(`Last modified date: ${last_modified_date}`);
                    }
                    else {
                        console.log("this image has the latest record ");
                    }
                }
                else {
                    // Download, resize, save image and metadata
                    try {
                        const hasPermission = await requestMediaLibraryPermission();
                        if (!hasPermission) {
                            Alert.alert("Permission Denied", "Media access permission is required.");
                            continue; // Skip this image
                        }
                          console.log('CameraRoll object:', CameraRoll);

                        // 1. Download the image and save to cache
                        const randomStr = Math.random().toString(36).substring(2, 8); // 6-character random string
                        const uniqueFilename = `image_${Date.now()}_${randomStr}.jpg`;
                        const downloadPath = `${RNFS.CachesDirectoryPath}/${uniqueFilename}`;
                        const download = await RNFS.downloadFile({
                            fromUrl: path,
                            toFile: downloadPath,
                        }).promise;

                        if (download.statusCode !== 200) throw new Error("Image download failed");

                        // 2. Resize the image
                        const resizedImage = await ImageResizer.createResizedImage(
                            `file://${downloadPath}`,
                            800, 600,
                            'JPEG', 80
                        );

                        // 3. Save resized image to gallery
                        const savedPath = await CameraRoll.save(resizedImage.uri, { type: 'photo' });

                        // 4. Store in database
                        const imageId = await InsertImageData({
                            path: savedPath,
                            capture_date: item.capture_date,
                            last_modified: item.last_modified,
                            hash: item.hash,
                        });
                        console.log('🖼️ Image inserted with ID:', imageId);

                        // 5. Insert persons and link
                        for (const person of item.persons) {
                            try {
                                const personId = await insertPerson({ person });
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


                        const eventIds = [];

                        for (const eventName of item.events) {
                            try {
                                const result = await insertEvent(eventName.name); // returns { message, id }
                                if (result?.id != null) {
                                    eventIds.push(result.id);
                                }
                            } catch (error) {
                                console.error(`Error processing event "${eventName}":`, error);
                            }
                        }
                        // 6. Call editDataForMultipleIds
                        await editDataForMultipleIds(
                            imageId,
                            item.persons,
                            eventIds,
                            item.eventDate,
                            item.location?.name ?? null,
                            item.currentDateFormatted
                        );

                        Alert.alert("Success", "Image saved and path stored.");
                    } catch (error) {
                        console.error("Process failed:", error);
                        Alert.alert("Error", error.message);
                    }

                }

                console.log(`ID: ${item.id}`);
                console.log(`Capture Date: ${item.capture_date}`);
                console.log(`Event Date: ${item.event_date}`);
                console.log(`location: ${item.location}`);
                console.log(`Path: ${item.path}`);
                console.log(`Persons:`);
                item.persons.forEach((person, index) => {
                    console.log(`  Person ${index + 1}:`, person);
                });
                console.log(`Events:`);
                item.events.forEach((event, index) => {
                    console.log(`  Event ${index + 1}:`, event);
                });
                console.log('---');
            }

        }
        catch (error) {
            console.error("Error fetching sync images:", error);
        }

    }

    return (
        <View>
            <View style={styles.allControlsContainer}>
                <Allcontrols text={data}></Allcontrols>
            </View>

            <View style={styles.contentContainer}>
                <Text style={styles.text}>
                    Seamlessly transfers images between your phone and PC, ensuring your files are always up to date on both devices.
                </Text>

                <View style={styles.imageContainer}>
                    <Image source={require('./src/images/sync.png')} style={styles.image} />


                </View>

                <Button
                    mode='contained'
                    style={styles.button}
                    labelStyle={styles.buttonText}
                    onPress={senddata}>
                    Sync Now
                </Button>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    text: {
        color: colors.dark,
        fontSize: 18,
        fontWeight: 'medium',
        padding: 20
    },
    allControlsContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,// Adjusts spacing between controls and the image container
    },
    contentContainer: {
        //flex: 1,
        justifyContent: 'center', // Centers vertically
        alignItems: 'center', // Centers horizontally
        marginTop: 200
    },
    image: {
        width: 200, // Adjust as needed
        height: 200, // Adjust as needed
        resizeMode: 'contain',
    },
    button: {
        backgroundColor: colors.primary,
        borderColor: colors.dark,
        borderWidth: 1
    },
    buttonText: {
        color: colors.dark // Replace with your colors.secondary value
    },
});

export default Sync;