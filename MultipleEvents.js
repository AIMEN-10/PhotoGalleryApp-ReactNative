import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, Button,TouchableOpacity } from 'react-native';
import { Checkbox } from 'react-native-paper'; // For checkboxes
import { getAllEvents } from './Databasequeries'; // Adjust import based on your file structure
import colors from './theme/colors'; // Use your color scheme

const MultipleEvents = ({ modalVisible, setModalVisible, setSelectedEvents }) => {
  const [eventData, setEventData] = useState([]);
  const [selectedEvents, setSelectedEventsState] = useState({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events = await getAllEvents(); // Fetch events from the database
        const formattedData = events.map(event => ({
          key: event.id,
          value: event.name,
        }));
        setEventData(formattedData); // Store events
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };

    if (modalVisible) {
      fetchEvents(); // Fetch events when the modal is visible
    }
  }, [modalVisible]);

  const toggleEvent = (eventId) => {
    setSelectedEventsState((prev) => ({
      ...prev,
      [eventId]: !prev[eventId], // Toggle event selection,touching the checkbox
    }));
  };

  const handleOkPress = () => {
    // Only pass the events that are selected (those that are checked)
    const selected = Object.keys(selectedEvents).filter(key => selectedEvents[key]);
    setSelectedEvents(selected); // Pass only selected events back to the parent
    setModalVisible(false); // Close the modal
  };

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setModalVisible(false)} // Close modal on back press
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Select Events</Text>

          {/* Event checkboxes */}
          {eventData.map(event => (
            <View key={event.key} style={styles.checkboxContainer}>
              <Checkbox
                status={selectedEvents[event.key] ? 'checked' : 'unchecked'}
                onPress={() => toggleEvent(event.key)} // Toggle event selection
                color={selectedEvents[event.key] ? colors.primary : '#dcdcdc'} // Set the color based on checked state
              />
              <Text style={styles.checkboxText}>{event.value}</Text>
            </View>
          ))}

          {/* Action buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.button} onPress={handleOkPress}>
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setModalVisible(false)} // Close the modal
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.dark,
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  checkboxText: {
    marginLeft: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#e74c3c', // Red color for cancel button
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MultipleEvents;
