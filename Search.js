import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Checkbox, Chip, Button } from 'react-native-paper';
import colors from './theme/colors';
import Allcontrols from './Allcontrols';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getAllEvents } from './Databasequeries';

const Search = ({ route }) => {
  const { data } = route.params || {};
  const [name, setName] = useState('');
  const [chips, setChips] = useState([]);
  const [isMaleChecked, setIsMaleChecked] = useState(false);
  const [isFemaleChecked, setIsFemaleChecked] = useState(false);

  // New states for multiple locations and dates
  const [locationInput, setLocationInput] = useState('');
  const [locations, setLocations] = useState([]);
  const [date, setDate] = useState(new Date());
  const [dates, setDates] = useState([]);
  const [show, setShow] = useState(false);

  const [eventData, setEventData] = useState([]);
  const [selectedEvents, setSelectedEventsState] = useState({});

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
    };
    fetchEvents();
  }, []);

  const toggleEvent = (eventId) => {
    setSelectedEventsState((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
    const formatted = formatDate(currentDate);
    if (!dates.includes(formatted)) {
      setDates([...dates, formatted]);
    }
  };

  const showDatepicker = () => {
    setShow(true);
  };

  const SearchImages = () => {
    console.log('Names:', chips);
    console.log('Genders:', isMaleChecked ? 'Male' : '', isFemaleChecked ? 'Female' : '');
    console.log('Locations:', locations);
    console.log('Capture Dates:', dates);
    console.log('Selected Events:', selectedEvents);
  };

  return (
    <View style={styles.container}>
      <View style={styles.allControlsContainer}>
        <Allcontrols text={data} />
      </View>

      <ScrollView style={styles.contentContainer}>
        {/* Name Input */}
        <View style={styles.nameContainer}>
          <Text style={styles.text}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={(text) => setName(text)}
            placeholder="Enter name"
            placeholderTextColor={colors.grey}
          />
          <Icon
            name="check-circle"
            size={30}
            color={colors.primary}
            onPress={() => {
              if (name.trim()) {
                setChips([...chips, name.trim()]);
                setName('');
              }
            }}
          />
        </View>

        {/* Name Chips */}
        <ScrollView horizontal contentContainerStyle={styles.chipRow}>
          {chips.map((chipText, index) => (
            <Chip
              key={index}
              onClose={() => setChips(chips.filter((_, i) => i !== index))}
              style={styles.chip}
              textStyle={{ color: colors.secondary }}
              closeIconColor={colors.secondary}
            >
              {chipText}
            </Chip>
          ))}
        </ScrollView>

        {/* Gender */}
        <Text style={styles.text}>Gender</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Checkbox
            status={isMaleChecked ? 'checked' : 'unchecked'}
            onPress={() => setIsMaleChecked(!isMaleChecked)}
            color={isMaleChecked ? colors.primary : '#dcdcdc'}
          />
          <Text style={{ fontSize: 18, color: colors.dark }}>Male</Text>

          <Checkbox
            status={isFemaleChecked ? 'checked' : 'unchecked'}
            onPress={() => setIsFemaleChecked(!isFemaleChecked)}
            color={isFemaleChecked ? colors.primary : '#dcdcdc'}
          />
          <Text style={{ fontSize: 18, color: colors.dark }}>Female</Text>
        </View>

        {/* Events */}
        <Text style={styles.text}>Events</Text>
        {eventData.map(event => (
          <View key={event.key} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Checkbox
              status={selectedEvents[event.key] ? 'checked' : 'unchecked'}
              onPress={() => toggleEvent(event.key)}
              color={selectedEvents[event.key] ? colors.primary : '#dcdcdc'}
            />
            <Text style={{ fontSize: 18, color: colors.dark }}>{event.value}</Text>
          </View>
        ))}

        {/* Capture Dates */}
        <Text style={styles.text}>Capture Dates</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
          <Icon name="event" size={30} color={colors.primary} onPress={showDatepicker} />
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

        <ScrollView horizontal contentContainerStyle={styles.chipRow}>
          {dates.map((d, index) => (
            <Chip
              key={index}
              onClose={() => setDates(dates.filter((_, i) => i !== index))}
              style={styles.chip}
              textStyle={{ color: colors.secondary }}
              closeIconColor={colors.secondary}
            >
              {d}
            </Chip>
          ))}
        </ScrollView>

        {/* Location Input */}
        <Text style={styles.text}>Location</Text>
        <View style={styles.nameContainer}>
          <TextInput
            style={styles.input}
            value={locationInput}
            onChangeText={(text) => setLocationInput(text)}
            placeholder="Enter location"
            placeholderTextColor={colors.grey}
          />
          <Icon
            name="check-circle"
            size={30}
            color={colors.primary}
            onPress={() => {
              if (locationInput.trim()) {
                setLocations([...locations, locationInput.trim()]);
                setLocationInput('');
              }
            }}
          />
        </View>

        <ScrollView horizontal contentContainerStyle={styles.chipRow}>
          {locations.map((loc, index) => (
            <Chip
              key={index}
              onClose={() => setLocations(locations.filter((_, i) => i !== index))}
              style={styles.chip}
              textStyle={{ color: colors.secondary }}
              closeIconColor={colors.secondary}
            >
              {loc}
            </Chip>
          ))}
        </ScrollView>

        {/* Search Button */}
        <View style={styles.buttoncontainer}>
          <Button
            mode="contained"
            style={styles.button}
            labelStyle={styles.buttonText}
            onPress={SearchImages}
          >
            Search
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  text: {
    color: colors.dark,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  allControlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  contentContainer: {
    marginTop: 80,
    padding: 10,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.dark,
    paddingVertical: 5,
    flex: 1,
    fontSize: 16,
    color: colors.dark,
  },
  chip: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    borderColor: colors.dark,
    borderWidth: 1,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  buttoncontainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  button: {
    backgroundColor: colors.primary,
    borderColor: colors.dark,
    borderWidth: 1,
  },
  buttonText: {
    color: colors.dark,
  },
});

export default Search;
