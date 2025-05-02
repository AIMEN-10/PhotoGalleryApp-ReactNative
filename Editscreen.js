import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, TextInput, Alert, ScrollView, FlatList } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from './theme/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AddEventPopup from './AddEventPopup';
import Location from './Location';
import { getAllEvents, getImageDetails } from './Databasequeries';
import { useFocusEffect } from '@react-navigation/native';
// const Editscreen = ( {imageId }) => {
const Editscreen = (props) => {
  //console.log("Editscreen props:", props);

  const { imageId, personData } = props;


  const navigation = useNavigation();
  const [name, setname] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventData, setEventData] = useState([]);
  const [location, setLocation] = useState(''); // Store location
  const [eventDate, setEventDate] = useState(' '); // Store the selected date
  // const [showDatePicker, setShowDatePicker] = useState(false); // Control visibility of the date picker
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [imageDetails, setImageDetails] = useState([]);
  const [hasPerson, setHasPerson] = useState(false);
  const [persondata, setpersondata] = useState([]);


  useFocusEffect(
    React.useCallback(() => {
      const personData = props.route?.params?.personData;
      if (personData) {
        console.log('Received person data:', personData);
        setpersondata(personData);
        props.navigation.setParams({ personData: undefined }); // clear to avoid re-trigger
      }
    }, [props.route?.params?.personData])
  );
  


  const Addevent = () => {
    setModalVisible(true);
  };
  const handleSelectListPress = async () => {
    await fetchEvents(); // Fetch events when the SelectList is pressed
  };
  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios' ? true : false); // Hide the picker on Android after selection
    setDate(currentDate);
    setEventDate(formatDate(currentDate)); // Format and set the selected date
  };

  const showDatepicker = () => {
    setShow(true);
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const currentDateFormatted = formatDate(new Date());
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events = await getAllEvents();
        const formattedData = events.map(event => ({
          key: event.id,
          value: event.name,
        }));

        setEventData(formattedData);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
      try {
        if(imageId) {
        const imageDet = await getImageDetails(imageId);
        setImageDetails(imageDet.persons);
        console.log("Fetched image details:", imageDet.persons);
        console.log("Fetched image details:", imageDetails);
        if (imageDet) {
          if (Array.isArray(imageDet.persons) && imageDet.persons.length > 0) {
            setHasPerson(true);
          } else {
            console.log("❌ No persons found in the image.");
          }
        } else {
          console.log('No image details found for this ID!');
        }
      }
      }
      catch (error) {
        console.error('Error fetching image details:', error);
      }
    };

    fetchEvents(); // Call the inner async function
  }, [imageId]);


  const handleSave = async () => {
    console.log('Saved:', { persondata, selectedEvent, eventDate, location });

  };


  return (
    <SafeAreaView >
      <View >
        {hasPerson && (
          <View>
            <View style={{ position: 'relative', left: '20%' }}>
              <Image

                source={{ uri: baseUrl + imageDetails[0].person_path }}
                style={{ height: 60, width: "20%" }}
              />
            </View>

            <View style={styles.nameContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.inputname}
                value={name}
                onChangeText={(text) => setname(text)} // Update state on text change
                placeholder="Enter name"
                placeholderTextColor={colors.grey}
              />
              <Text
                style={styles.label}
                onPress={() =>
                  navigation.navigate('PersonInfo', {
                    imageDetails
                  }
                    // onGoBack: (data) => {
                    //   console.log('Got dataaa from PersonInfo:', data);
                    //   setpersondata(data); 
                    // },}
                  )
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

            <TouchableOpacity onPress={handleSelectListPress}>
              <SelectList
                data={eventData}
                setSelected={setSelectedEvent} // Event selection
                placeholder="Select an event"
                save="value"
                boxStyles={styles.dropdown}
                inputStyles={[styles.input, { color: 'black' }]}
                searchInputStyle={{ color: 'black' }}
                dropdownTextStyles={{ color: 'black' }}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={Addevent}>
            <Icon name="add-circle" size={24} color={colors.primary} style={{ marginTop: 10 }} />
          </TouchableOpacity>
          <AddEventPopup
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
          />
        </View>



        <Text style={styles.label}>Event Date</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
          <Text style={{ fontSize: 18, color: colors.dark }}>
            {eventDate}
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

        {/* Conditionally render DateTimePicker */}
        {/* {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={onChange}
            />
          )} */}
        <View style={styles.nameContainer}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.inputname}
            value={location}
            onChangeText={(text) => setLocation(text)} // Update state on text change
            placeholder="Enter Location"
            placeholderTextColor={colors.grey}
            color={colors.dark}
          />
          {/* <ScrollView nestedScrollEnabled={true}>
  <Location />
</ScrollView> */}


        </View>
        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({


  nameContainer: {
    flexDirection: 'row', // To display the label and input next to each other
    alignItems: 'center', // Vertically align the text and input
    marginVertical: 15, // Space between sections
    gap: 20
  },
  inputname: {
    borderBottomWidth: 1, // Creates the underline
    borderBottomColor: colors.dark, // Set the color for the underline
    paddingVertical: 5, // Vertical padding for the input field
    flex: 1, // Take the remaining space for the input
    fontSize: 16, // Adjust font size for input text
    color: colors.dark

  },


  label: {
    color: colors.dark, // White color for labels
    fontSize: 14,
    marginBottom: 5,
  },
  // detailValue: {
  //   backgroundColor: '#0D6068', // Dark background for inputs to blend with the form container
  //   color: colors.dark, // White text color
  //   borderWidth: 1,
  //   borderColor: colors.secondary,
  //   marginBottom: 15,
  //   padding: 10,
  //   height: 40, // Reduce height for better mobile compatibility
  //   borderRadius: 5,
  //   fontSize: 14, // Adjust font size to fit better in smaller inputs
  // },
  saveButton: {
    backgroundColor: colors.primary, // Button color same as the form container
    paddingVertical: 8, // Reduced padding for a smaller button
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    width: '40%',
    alignSelf: 'center', // Center the button horizontally
  },
  saveButtonText: {
    color: colors.secondary, // White text for the button
    fontWeight: 'bold',
    fontSize: 14, // Adjust font size for the button
  },
  dropdown: {
    backgroundColor: colors.secondary, // White background for the dropdown
    borderRadius: 5,
    marginBottom: 15,
    textDecorationColor: colors.dark
  },
  input: {
    fontSize: 15, // Adjust font size for input text

  },
});

export default Editscreen;
