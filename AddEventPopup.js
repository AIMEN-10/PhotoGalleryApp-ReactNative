import React, { useState } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import colors from './theme/colors';
import { insertEvent } from './Databasequeries'; // Adjust the import based on your file structure
const AddEventPopup = ({ modalVisible, setModalVisible }) => {
  const [eventName, setEventName] = useState('');

  const addevent = async (text) => {
    console.log('Adding event:', text);
    try {
      const res= await insertEvent(text);  // Get message from insertEvent
      console.log('Insert message:', res.message);  // Log the raw message for debugging
    
      // Check the message and perform actions accordingly
      if (res.message === 'Event inserted successfully.') {
        Alert.alert('Success', res.message, [
          {
            text: 'OK',
            onPress: () => {
              setModalVisible(false);
              setEventName('');
            },
          },
        ]);
      } else if (res.message === 'Event already exists.') {
        Alert.alert('Error', res.message, [
          {
            text: 'OK',
            onPress: () => {
              setModalVisible(false);
              setEventName('');
            },
          },
        ]);
      } else {
        console.warn('Unexpected message:', res.message);  // Log unexpected message
      }
      
    } catch (error) {
      console.error('Failed to add event:', error);
    }
    
    
      
};



return (
  <Modal
    visible={modalVisible}
    transparent
    animationType="slide"
  >
    <View style={styles.modalBackground}>
      <View style={styles.modalContent}>
        <Text style={{ color: 'black', fontWeight: 'bold' }}>Add New Event</Text>
        <TextInput
          placeholder="Enter event name"
          value={eventName}
          onChangeText={setEventName}
          style={styles.input}
          placeholderTextColor="gray"
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {/* <Button title="Add" onPress={() => addevent(eventName)} /> */}

          <Button
            mode='contained'
            style={styles.button}
            labelStyle={styles.buttonText}
            onPress={() => addevent(eventName)}>
            Add
          </Button>

          <Button
            mode='contained'
            style={styles.button}
            labelStyle={styles.buttonText}
            onPress={() => setModalVisible(false)}>
            Cancel
          </Button>
        </View>
      </View>
    </View>
  </Modal>
);
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    //backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,

  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    borderColor: 'black',
    borderWidth: 1,

  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 10,
    color: 'black',
    fontSize: 16,
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

export default AddEventPopup;
