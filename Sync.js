import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { Button } from 'react-native-paper';
import colors from './theme/colors';
import Allcontrols from './Allcontrols';
import { SvgXml } from 'react-native-svg';
import SyncLogo from './src/images/sync_logo.svg';
import { getAllSyncImages, getImageDetails } from './Databasequeries';


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
            result.forEach(item => {
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
            });

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