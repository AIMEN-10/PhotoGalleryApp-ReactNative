import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';

const Test = () => {
  const [selectedEvent, setSelectedEvent] = useState(null); // Store selected event (key)
  const [eventData, setEventData] = useState([]); // Initialize eventData as an empty array

  // Replace 'baseUrl' with your actual API base URL
  //const baseUrl = 'https://your-api-url-here/'; // Add your base API URL here

  // Fetch events data from API
  useEffect(() => {
    fetch(baseUrl + 'api/Image/getAllEvents') // Replace with your actual API endpoint
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          // Prepare data for SelectList
          const eventData = data.map(event => ({
            key: event.id.toString(), // Unique key for each event
            value: event.name, // Display the event name
          }));
          setEventData(eventData); // Set the events for the dropdown
        } else {
          console.log('No events found!');
        }
        console.log(eventData)
      })
      .catch(error => {
        console.error('Error fetching events:', error);
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select an Event</Text>

      {/* Event Input (Dropdown) */}
      <SelectList
        data={eventData} // Items to be displayed in the dropdown
        setSelected={setSelectedEvent} // Update the selected event
        placeholder="Select an event"
        save="value" // Save the selected event value
        boxStyles={styles.dropdown} // Style for the dropdown box
        inputStyles={[styles.input, { color: 'black' }]} // Make the text color black
      />

      <Text style={styles.selectedEvent}>Selected Event: {selectedEvent}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  selectedEvent: {
    marginTop: 20,
    fontSize: 16,
    color: 'black',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 15,
  },
  input: {
    fontSize: 14,
    padding: 10,
  },
});

export default Test;
