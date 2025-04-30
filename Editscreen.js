import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, Alert } from 'react-native';
import { TextInput } from 'react-native-paper';
import { SelectList } from 'react-native-dropdown-select-list';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from './theme/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AddEventPopup from './AddEventPopup';
import { getAllEvents,getImageDetails } from './Databasequeries'; // Adjust the import based on your file structure

const Editscreen = ({ imageId }) => {
  const navigation = useNavigation();
  const [name, setname] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null); // Store selected event (key)
  const [eventData, setEventData] = useState([]);
  //const [eventDate, setEventDate] = useState(''); // Store event date
  const [location, setLocation] = useState(''); // Store location
  const [eventDate, setEventDate] = useState(new Date()); // Store the selected date
  const [showDatePicker, setShowDatePicker] = useState(false); // Control visibility of the date picker
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

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
  const currentDateFormatted = formatDate(new Date());
    useEffect(() => {
  const fetchEvents = async () => {
    try {
      const events = await getAllEvents();
      const formattedData = events.map(event => ({
        key: event.id,        // unique identifier
        value: event.name,    // display value
      }));

      setEventData(formattedData);
      console.log('Fetched events:', { events }); // Log the fetched events
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
    try{
      const imageDetails = await getImageDetails({imageId}); // Fetch image details using the imageId
      if (imageDetails) {
        console.log('Fetched image details:', imageDetails); // Log the fetched image details
        // setname(imageDetails.name); // Set the name from the fetched image details
        // setSelectedEvent(imageDetails.eventName); // Set the selected event from the fetched image details
        // setEventDate(new Date(imageDetails.eventDate)); // Set the event date from the fetched image details
        // setLocation(imageDetails.location); // Set the location from the fetched image details
      } else {
        console.log('No image details found for this ID!');
      }
    }
    catch (error) {
      console.error('Failed to fetch imagedata:', error);
    }
  };

    fetchEvents(); // Call the inner async function
  }, []);
  // Fetch events data from API
  // useEffect(() => {
  //     fetch(baseUrl + 'api/Image/getAllEvents') // Replace with your actual API endpoint
  //       .then(response => response.json())
  //       .then(data => {
  //         if (data.length > 0) {
  //           // Prepare data for SelectList
  //           const eventData = data.map(event => ({
  //             key: event.id.toString(), // Unique key for each event
  //             value: event.name, // Display the event name
  //           }));
  //           setEventData(eventData); // Set the events for the dropdown
  //         } else {
  //           console.log('No events found!');
  //         }
  //         //console.log(eventData)
  //       })
  //       .catch(error => {
  //         console.error('Error fetching events:', error);
  //       });
  //   }, []);




  // const onChange = (event, selectedDate) => {
  //   const currentDate = selectedDate || eventDate;
  //   setShowDatePicker(false); // Automatically hide the picker after selection on Android
  //   setEventDate(currentDate);
  // };

  // // Function to show date picker
  // const showDatepicker = () => {
  //   setShowDatePicker(true); // Show the date picker when the user clicks the button
  // };
  // Handle Save action
  const handleSave = async () => {
    console.log('Saved:', { selectedEvent, eventDate, location });
    const imageId = 33;
    try {
      // Prepare the formatted date as 'YYYY-MM-DD'
      const formattedDate = eventDate.toISOString().split('T')[0];

      // Prepare the contact data to send to the API (this is just the data you want to send)
      const contactData = {
        selectedEvent,
        formattedDate,
        location
      };

      // Build the URL with query parameters (as per your server-side expectations)
      const url = `${baseUrl}api/Image/EditImageData?imageId=${imageId}&EventName=${encodeURIComponent(selectedEvent)}&EventDate=${encodeURIComponent(formattedDate)}&Location=${encodeURIComponent(location)}`;

      // Make the POST request with fetch
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // If you want to send the contact data as JSON in the body, uncomment the next line
        // body: JSON.stringify(contactData),
      });

      // Check if the response is ok (status code 200-299)
      if (!res.ok) {
        // If the response is not successful, attempt to read it as plain text
        const errorDetails = await res.text();
        console.error('Request failed with status:', res.status, errorDetails);
      } else {
        // If the response is successful, parse it as JSON
        const responseData = await res.json();
        console.log('Data saved successfully:', responseData);
      }
    } catch (error) {
      // Log any other errors that occur during the fetch request
      console.error('Error during fetch:', error);
    }
  };


  return (
    <SafeAreaView >
      <View >


        {/* Bottom Half - Event Form Section */}
        <View >
          <View style={{ position: 'relative', left: '20%' }}>

            <Image
              source={require("..\\src\\images\\ff2232602f8c4ac486a8e0b66ebe5f0a.jpg")}
              style={{ height: 60, width: "20%" }}  // Correctly set the height and width
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
            <Text style={styles.label} onPress={() => navigation.navigate('PersonInfo')}>More...</Text>
            {/* <Icon name="check-circle" size={30} color={colors.primary} /> */}
          </View>
          <Text style={styles.label}>Event</Text>

          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, width: '100%' }}>
              {/* <SelectList
                data={eventData}
                setSelected={setSelectedEvent}
                placeholder="Select an event"
                save="value"
                boxStyles={styles.dropdown}
                inputStyles={[styles.input, { color: 'black' }]}
                searchInputStyle={{ color: 'black' }}
                dropdownTextStyles={{ color: 'black' }}  
              /> */}
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

          {/* <Text style={styles.label}>Event Date</Text>

          <TouchableOpacity onPress={showDatepicker} style={styles.datePickerButton}>
            <Text style={styles.datePickerButtonText}>
              {eventDate ? eventDate.toLocaleDateString() : 'Select Date'}
            </Text>
          </TouchableOpacity> */}

          <Text style={styles.label}>Event Date</Text>
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

          {/* Conditionally render DateTimePicker */}
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={eventDate}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={onChange}
            />
          )}
          <View style={styles.nameContainer}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.inputname}
              value={name}
              onChangeText={(text) => setlocation(text)} // Update state on text change
              placeholder="Enter name"
              placeholderTextColor={colors.grey}
            />
          </View>
          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
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
    height: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark,
    size: 1,
    flex: 1,
    fontSize: 15,
    backgroundColor: colors.secondary,
    color: 'white',

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
