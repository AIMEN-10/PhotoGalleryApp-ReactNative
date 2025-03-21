import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Pressable, TextInput, ScrollView, TouchableOpacity, PermissionsAndroid, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Checkbox, Chip, Button } from 'react-native-paper';
import colors from './theme/colors';
import Allcontrols from './Allcontrols';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapView, { Marker, Polygon, Polyline } from "react-native-maps";

const Search = ({ route }) => {
  const { data } = route.params || {};
  const [name, setName] = useState('');
  const [visible, setVisible] = useState(true);

  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios' ? true : false); // Hide the picker on Android after selection
    setDate(currentDate);
  };

  const showDatepicker = () => {
    setShow(true);
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Adding leading 0 for months < 10
    const day = String(date.getDate()).padStart(2, '0'); // Adding leading 0 for days < 10
    return `${year}-${month}-${day}`;
  };

  const [marker, setMarker] = useState({
    latitude: 33.64252919601249,
    longitude: 73.07839628309011
  })

  const [markers, setMarkers] = useState([]);
  const handleMapPress = (event) => {
    const coordinate = event.nativeEvent.coordinate;
    setMarkers([...markers, coordinate])
    console.log(markers)
    // console.log(coordinate)
    // setMarker(coordinate);
  }
  return (
    <View>
    
      <View style={styles.allControlsContainer}>
        <Allcontrols text={data}></Allcontrols>
      </View>
      <ScrollView>
      <View style={styles.contentContainer}>

        <View style={styles.nameContainer}>
          <Text style={styles.text}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={(text) => setName(text)} // Update state on text change
            placeholder="Enter name"
            placeholderTextColor={colors.grey}
          />
          <Icon name="check-circle" size={30} color={colors.primary} />
        </View>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} // Hides scroll bar
          contentContainerStyle={{ flexDirection: 'row', gap: 10, paddingHorizontal: 10 }} // ✅ Proper row layout
        >
          {visible && (
            <Chip
              onPress={() => console.log('Pressed')}
              onClose={() => {
                setVisible(false);
                console.log('Chip Closed');
              }}
              style={styles.chip}
              textStyle={{ color: colors.secondary }}  // Text color
              closeIconColor={colors.secondary || 'black'} // Custom color for close icon (Red)
            >
              Aimen
            </Chip>
          )}
          <Chip onPress={() => console.log('Pressed')}
            onClose={() => console.log('Chip Closed')}
            style={styles.chip}
          >Eman</Chip>
          <Chip onPress={() => console.log('Pressed')}
            onClose={() => console.log('Chip Closed')}
            style={styles.chip}
          >Eman</Chip>
          <Chip onPress={() => console.log('Pressed')}
            onClose={() => console.log('Chip Closed')}
            style={styles.chip}
          >Eman</Chip>
          <Chip onPress={() => console.log('Pressed')}
            onClose={() => console.log('Chip Closed')}
            style={styles.chip}
          >Eman</Chip>
        </ScrollView>
        <View >
          <Text style={styles.text}>Gender</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>

            <Checkbox

            />
            <Text style={{ fontSize: 18, color: colors.dark }}>Male</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

              <Checkbox

              />
              <Text style={{ fontSize: 18, color: colors.dark }}>Female</Text>
            </View>
          </View>
        </View>

        <View >

          <Text style={styles.text}>Events</Text>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Checkbox

              />
              <Text style={{ fontSize: 18, color: colors.dark }}>Birthday</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

              <Checkbox

              />
              <Text style={{ fontSize: 18, color: colors.dark }}>Convocation</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

              <Checkbox

              />
              <Text style={{ fontSize: 18, color: colors.dark }}>Convocation</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

              <Checkbox

              />
              <Text style={{ fontSize: 18, color: colors.dark }}>Convocation</Text>
            </View>
          </View>
        </View>
        <View>


          <Text style={styles.text}>Capture Date</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            <Text style={{ fontSize: 18, color: colors.dark }}>
              {formatDate(date)}
            </Text>

            <Icon
              name="event"
              size={30}
              color={colors.primary}
              onPress={showDatepicker}
            />

            {show && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={onChange}
              />
            )}
          </View>
          <View>
            <Text style={styles.text}>Location</Text>
            <MapView
              style={{ width: '100%', height: 200, }}
              initialRegion={{
                latitude: 33.64252919601249,
                longitude: 73.07839628309011,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              onPress={handleMapPress}
            >
              {
                markers.map((marker) => (<Marker coordinate={marker} />))
              }
              {
                markers.length > 2 &&
                <Polygon
                  coordinates={markers}
                  fillColor="rgba(28,110,168,0.3)"
                  strokeColor="blue"
                  strokeWidth={2} />
              }

            </MapView>

          </View>
          <View style={styles.buttoncontainer}>
            <Button
              mode='contained'
              style={styles.button}
              labelStyle={styles.buttonText}>
              Search
            </Button>
          </View>
        </View>
      </View>

    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    color: colors.dark,
    fontSize: 18,
    fontWeight: 'bold'
  },
  allControlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,// Adjusts spacing between controls and the image container
  },
  contentContainer: {
     
    marginTop: 80,
    paddingtop: 30,
    padding:10,
    
  },
  nameContainer: {
    flexDirection: 'row', // To display the label and input next to each other
    alignItems: 'center', // Vertically align the text and input
    marginVertical: 20, // Space between sections
    gap: 20
  },
  input: {
    borderBottomWidth: 1, // Creates the underline
    borderBottomColor: colors.dark, // Set the color for the underline
    paddingVertical: 5, // Vertical padding for the input field
    flex: 1, // Take the remaining space for the input
    fontSize: 16, // Adjust font size for input text
    color: colors.dark
  },
  chip: {
    backgroundColor: colors.primary, // Light grey background
    alignSelf: 'flex-start', // Make it adjust based on content width
    borderColor: colors.dark,
    borderWidth: 1
  },
  buttoncontainer: {
    flex: 1,
    justifyContent: 'center', // Center the button vertically
    alignItems: 'center', // Center the button horizontally
    padding: 18,
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

export default Search;
