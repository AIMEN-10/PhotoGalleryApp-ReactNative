import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView } from 'react-native';
import { TextInput } from 'react-native-paper';
import { SelectList } from 'react-native-dropdown-select-list'; 
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from './theme/colors';

const Editscreen = () => {
  const [selectedEvent, setSelectedEvent] = useState(null); // Store selected event (key)
  const [eventData, setEventData] = useState([]); 
  //const [eventDate, setEventDate] = useState(''); // Store event date
  const [location, setLocation] = useState(''); // Store location
  const [eventDate, setEventDate] = useState(new Date()); // Store the selected date
  const [showDatePicker, setShowDatePicker] = useState(false); // Control visibility of the date picker

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
  
  
  
  
    const onChange = (event, selectedDate) => {
      const currentDate = selectedDate || eventDate;
      setShowDatePicker(false); // Automatically hide the picker after selection on Android
      setEventDate(currentDate);
    };
  
    // Function to show date picker
    const showDatepicker = () => {
      setShowDatePicker(true); // Show the date picker when the user clicks the button
    };
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        

        {/* Bottom Half - Event Form Section */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Event</Text>

          
          <SelectList
                  data={eventData} // Items to be displayed in the dropdown
                  setSelected={setSelectedEvent} // Update the selected event
                  placeholder="Select an event"
                  save="value" // Save the selected event value
                  boxStyles={styles.dropdown} // Style for the dropdown box
                  inputStyles={[styles.input, { color: 'black' }]} // Make the text color black
                  searchInputStyle={{ color: 'black' }}
                />

          <Text style={styles.label}>Event Date</Text>
         
<TouchableOpacity onPress={showDatepicker} style={styles.datePickerButton}>
        <Text style={styles.datePickerButtonText}>
          {eventDate ? eventDate.toLocaleDateString() : 'Select Date'}
        </Text>
      </TouchableOpacity>

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
      
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.detailValue}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter Location"
            placeholderTextColor="#aaa"
            underlineColor="#fff"
          />

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
  safeArea: {
    flex: 1,
    backgroundColor: colors.dark, // Light background color for the safe area
  },
  container: {
    //flex: 1,
    //flexDirection: 'column',
  },
  // imageContainer: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  // image: {
  //   width: '100%', // Image should take full width
  //   height: '50%', // Image takes up the top half of the screen
  //   resizeMode: 'cover', // Ensure image scales correctly
  // },
  formContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 20,
    backgroundColor: '#0D6068', // Form container color
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  label: {
    color: colors.dark, // White color for labels
    fontSize: 14,
    marginBottom: 5,
  },
  detailValue: {
    backgroundColor: '#0D6068', // Dark background for inputs to blend with the form container
    color: 'black', // White text color
    borderWidth: 1,
    borderColor: '#fff',
    marginBottom: 15,
    padding: 10,
    height: 40, // Reduce height for better mobile compatibility
    borderRadius: 5,
    fontSize: 14, // Adjust font size to fit better in smaller inputs
  },
  saveButton: {
    backgroundColor: '#0D6068', // Button color same as the form container
    paddingVertical: 8, // Reduced padding for a smaller button
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    width: '40%',
    alignSelf: 'center', // Center the button horizontally
  },
  saveButtonText: {
    color: '#fff', // White text for the button
    fontWeight: 'bold',
    fontSize: 14, // Adjust font size for the button
  },
  dropdown: {
    backgroundColor: '#fff', // White background for the dropdown
    borderRadius: 5,
    marginBottom: 15,
    textDecorationColor:'black'
  },
  input: {
    fontSize: 14, // Adjust font size for input text
    padding: 10,
  },
});

export default Editscreen;
