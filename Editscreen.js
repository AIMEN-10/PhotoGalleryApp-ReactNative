import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, TextInput, Alert, ScrollView, FlatList } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from './theme/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AddEventPopup from './AddEventPopup';
import Location from './Location';
import { getAllEvents, getImageDetails, editDataForMultipleIds, getPersonData, getAllPersonLinks, getAllPersons, handleUpdateEmbeddings } from './Databasequeries';
import { useFocusEffect } from '@react-navigation/native';
import MultipleEvents from './MultipleEvents';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EmbeddingModal from './EmbeddingModal'; // adjust path if needed


const Editscreen = (props) => {

  const { imageId, personData } = props;
  const navigation = useNavigation();
  const [name, setname] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventData, setEventData] = useState([]);
  const [location, setLocation] = useState(''); // Store location
  const [eventDate, setEventDate] = useState(''); // Store the selected date
  // const [showDatePicker, setShowDatePicker] = useState(false); // Control visibility of the date picker
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modaleventsVisible, seteventsModalVisible] = useState(false);

  const [imageDetails, setImageDetails] = useState([]);
  const [hasPerson, setHasPerson] = useState(false);
  const [persondata, setpersondata] = useState([]);

  const [receivedpersondata, setreceivedpersondata] = useState([]);

  const [personDataa, setPersonDataa] = useState([]);
  const [imageIdd, setImageIdd] = useState(null);
  const [received, setReceived] = useState(false);

  const [embmodalVisible, setembModalVisible] = useState(false);
  const [embeddingResult, setEmbeddingResult] = useState({});
  const [selectedPerson, setSelectedPerson] = useState(null);

  const saveToStorageOrBackend = async (data) => {
    try {
      // Get the existing data from AsyncStorage
      const existingData = await AsyncStorage.getItem('savedPersonData');
      const parsedData = existingData ? JSON.parse(existingData) : [];

      // Append the new data to the existing array
      const updatedData = [...parsedData, data];

      // Save the updated array back to AsyncStorage
      await AsyncStorage.setItem('savedPersonData', JSON.stringify(updatedData));
      console.log('📦 Data saved to AsyncStorage:', updatedData);
    } catch (e) {
      console.error('❌ Failed to save:', e);
    }
  };
  const getLatestSavedValue = async () => {
    try {
      // Fetch the saved data from AsyncStorage
      const savedData = await AsyncStorage.getItem('savedPersonData');
      const parsedData = savedData ? JSON.parse(savedData) : [];

      // Get the latest record (last element in the array)
      const latestRecord = parsedData[parsedData.length - 1];

      if (latestRecord) {
        console.log('📦 Latest Saved Record:', latestRecord);
        return latestRecord;
      } else {
        console.log('❌ No saved data found');
        return null;
      }
    } catch (e) {
      console.error('❌ Failed to fetch saved data:', e);
      return null;
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const incomingPersonData = props.route?.params?.personData;
      const incomingImageId = props.route?.params?.imageId;

      if (!received && (incomingPersonData || incomingImageId)) {
        if (incomingPersonData) {
          console.log('✅ Received person data:', incomingPersonData);
          saveToStorageOrBackend(incomingPersonData);
          setPersonDataa(incomingPersonData);
        }

        if (incomingImageId) {
          console.log('✅ Received imageId:', incomingImageId);
          setImageIdd(incomingImageId);
        }

        setReceived(true); // Lock this branch after first use
      }
    }, [props.route?.params, received])
  );

  // Only log when both are valid
  useEffect(() => {
    if (imageIdd !== null && personDataa.length > 0) {
      console.log('✅ FINAL imageId:', imageIdd);
      console.log('✅ FINAL personData:', personDataa);

      // You can now safely save or process
    }
  }, [imageIdd, personDataa]);



  const Addevent = () => {
    setModalVisible(true);
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
        if (imageId) {
          if (Array.isArray(imageId)) {
            console.log(imageId)
          }
          else {
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
      }
      catch (error) {
        console.error('Error fetching image details:', error);
      }
    };

    fetchEvents(); // Call the inner async function
  }, [imageId]); // Add imageId as a dependency

  const clearAllAsyncStorage = async () => {
    try {
      await AsyncStorage.clear();
      console.log('🗑️ All AsyncStorage data cleared!');
    } catch (e) {
      console.error('❌ Failed to clear AsyncStorage:', e);
    }
  };
  const [selectedEvents, setSelectedEvents] = useState([]);

  const handleSelectedEvents = (events) => {

    const selected = Object.keys(events).filter((key) => events[key]).map((key) => events[key]);
    setSelectedEvents(selected);

    console.log('Selected events:', selected);
  };
  const recognizePerson = async (name, imagePath) => {
    // const url = `http://192.168.100.22:5000/recognize_person?image_path=${encodeURIComponent(imagePath)}&name=${encodeURIComponent(name)}`;

    const url = `${baseUrl}recognize_person?image_path=${encodeURIComponent(imagePath)}&name=${encodeURIComponent(name)}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
      });

      const result = await response.json();
      // console.log('Recognition result:', result);


    } catch (error) {
      console.error('Error recognizing person:', error);
    }
    const persons = await getAllPersons();
    const links = await getAllPersonLinks();
    const person1 = imagePath.split('/')[2];
    // console.log('abccc', imagePath);
    const data_url = `${baseUrl}load_embeddings_for_recognition`;
    const payload = {
      persons,
      links,
      person1,
    };

    try {
      const response = await fetch(data_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      // console.log('Embedding group after recognition:', result);
      await handleUpdateEmbeddings(name, result);

      // return result.group || result;  // adapt depending on response structure
    } catch (error) {
      console.error('Error fetching embedding group for recognition:', error);
      return [];
    }
  };

  const getemb = async (persons, links, person1,personrecords) => {

    const url = `${baseUrl}load_embeddings`;
    const payload = {
      persons,
      links,
      person1,
      personrecords
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      return result.group || result;  // adapt depending on response structure
    } catch (error) {
      console.error('Error fetching embedding group:', error);
      return [];
    }


  };


  const handleSave = async () => {
    const latestValue = await getLatestSavedValue();
    const persons = latestValue;          // Get the list of persons

    if (Array.isArray(persons)) {
      for (const person of persons) {
        console.log(person.personPath);
        const path = person.personPath.replace('face_images', './stored-faces');
        // console.log('Recognizing person:', person.name, 'at path:', path);
        await recognizePerson(person.name, path);
      }
    } else {
      //console.warn('No valid persons array found in latestValue');
    }
    console.log('✅ Saved :', {
      eventDate,
      imageId,
      location,
      selectedEvents,
      latestValue,
    });
    var result = editDataForMultipleIds(imageId, latestValue, selectedEvents, eventDate, location);
    clearAllAsyncStorage()

  };
  const handleEmbeddingCheck = async (persons, links, person1,personrecords) => {
    const result = await getemb(persons, links, person1,personrecords);
    if (result && Object.keys(result).length > 0) {
      console.log('Embedding group:', person1);
      setSelectedPerson(person1);
      setEmbeddingResult(result);
      setembModalVisible(true);
    }
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
                placeholder="Edit person name"
                placeholderTextColor={colors.grey}
                editable={false}
              />
              <Text
                style={styles.label}
                onPress={() =>
                  navigation.navigate('PersonInfo', {
                    imageDetails, screen: 'edit',
                    onGoBack: (personData) => {
                      saveToStorageOrBackend(personData);
                      setPersonDataa(personData);
                      console.log('Returned data:', personData);

                      const fetchPersons = async () => {
                        const groupedPersons = {};

                        for (const person of personData) {
                          if (person.name && person.name !== "unknown") {
                            if (!groupedPersons[person.name]) {
                              groupedPersons[person.name] = [];
                            }
                            groupedPersons[person.name].push(person);
                          }
                        }

                        for (const name in groupedPersons) {
                          console.log('Processing name:', name);

                          const personDataList = await getPersonData(name);
                          const personrecords=await getAllPersons();
                          console.log('Person(s) for', name, ':', personDataList);

                          const Links = await getAllPersonLinks();

                          for (const person of groupedPersons[name]) {
                            // Now you're handling each person with the same name individually
                            await handleEmbeddingCheck(personDataList, Links, person,personrecords);
                          }
                        }
                      };

                      fetchPersons();
                    }

                  }

                  )
                }
              >
                More...
              </Text>
            </View>
          </View>
        )}
        <EmbeddingModal
          visible={embmodalVisible}
          onClose={() => setembModalVisible(false)}
          embeddingData={embeddingResult}
          selectedPerson={selectedPerson}
        />
        <Text style={styles.label}>Event</Text>

        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, width: '100%' }}>

            <TouchableOpacity onPress={() => seteventsModalVisible(true)}>
              <Text style={styles.labels}>Select an event</Text>
            </TouchableOpacity>

            <MultipleEvents
              modalVisible={modaleventsVisible}
              setModalVisible={seteventsModalVisible}
              setSelectedEvents={handleSelectedEvents}
            />



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
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} >
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
  labels: {
    color: colors.dark, // White color for labels
    fontSize: 16,
    marginBottom: 5,
    fontweight: 'bold',
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
