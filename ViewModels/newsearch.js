import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Checkbox, Chip, Button } from 'react-native-paper';
import colors from './theme/colors';
import Allcontrols from './Allcontrols';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getAllEvents } from './Databasequeries';

const Search = ({ route }) => {
  const { data } = route.params || {};
  const [name, setName] = useState('');
  const [chips, setChips] = useState([]);
  const [isMaleChecked, setIsMaleChecked] = useState(false);
  const [isFemaleChecked, setIsFemaleChecked] = useState(false);

  const [locationInput, setLocationInput] = useState('');
  const [locations, setLocations] = useState([]);

  const [yearInput, setYearInput] = useState('');
  const [monthInput, setMonthInput] = useState('');
  const [dates, setDates] = useState([]);

  const [eventData, setEventData] = useState([]);
  const [selectedEvents, setSelectedEventsState] = useState({});
  const [Age, setAge] = useState();
  const navigation = useNavigation();

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

  const addDateFilter = () => {
    if (!yearInput && !monthInput) return;

    let prefix = '';
    if (yearInput && monthInput) {
      prefix = `${yearInput}-${String(monthInput).padStart(2, '0')}`; // e.g., '2025-07'
    } else if (yearInput) {
      prefix = yearInput;
    }

    if (prefix && !dates.includes(prefix)) {
      setDates([...dates, prefix]);
    }

    setYearInput('');
    setMonthInput('');
  };

  const SearchImages = async () => {
    const filters = {
      Names: chips,
      Genders: [isMaleChecked ? 'M' : '', isFemaleChecked ? 'F' : ''],
      Age: Age,
      Locations: locations,
      CaptureDates: dates,
      SelectedEvents: selectedEvents,
    };
    navigation.navigate('Searchfilters', { data: filters });
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

        {/* Age */}
        <Text style={styles.text}>Age</Text>
        <TextInput
          style={styles.input}
          value={Age}
          onChangeText={(text) => setAge(text)}
          placeholder="Enter Age"
          placeholderTextColor={colors.grey}
          keyboardType="number-pad"
        />

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

        {/* Capture Date Filters */}
        <Text style={styles.text}>Capture Date</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Enter year (e.g. 2025)"
            keyboardType="numeric"
            value={yearInput}
            onChangeText={setYearInput}
            placeholderTextColor={colors.grey}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Enter month (1-12)"
            keyboardType="numeric"
            value={monthInput}
            onChangeText={setMonthInput}
            placeholderTextColor={colors.grey}
          />
          <Icon
            name="check-circle"
            size={30}
            color={colors.primary}
            onPress={addDateFilter}
          />
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
    flex: 1,
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

//db

const searchImages = (filters) => {
  return new Promise((resolve, reject) => {
    const {
      Names = [],
      Genders = [],
      Age = [],
      Locations = [],
      CaptureDates = [],
      SelectedEvents = {},
    } = filters;

    const clean = (arr) =>
      Array.isArray(arr)
        ? arr.filter((val) => val && val.toString().trim() !== '')
        : [];

    const wrapValues = (arr) =>
      clean(arr)
        .map((v) => `'${v.toString().replace(/'/g, "''")}'`)
        .join(',');

    const nameStr = wrapValues(Names);
    const genderStr = wrapValues(Genders);
    const ageStr = wrapValues(Age);
    const locationStr = wrapValues(Locations);

    const eventIds = Object.keys(SelectedEvents).filter((id) => SelectedEvents[id]);
    const eventStr = wrapValues(eventIds);

    let query = `
      SELECT DISTINCT i.*
      FROM Image i
      JOIN imagePerson ip ON ip.image_id = i.id
      JOIN person p ON p.id = ip.person_id
      LEFT JOIN Location l ON l.id = i.location_id
      LEFT JOIN imageEvent ie ON ie.image_id = i.id
      LEFT JOIN Event e ON e.id = ie.event_id
      WHERE i.is_deleted = 0
    `;

    const personConditions = [];

    // Person Filters
    if (Names.length) {
      const likeConditions = clean(Names).map(
        (name) => `p.name LIKE '%${name.replace(/'/g, "''")}%'`
      );
      personConditions.push(`(${likeConditions.join(' OR ')})`);
    }

    if (genderStr) personConditions.push(`p.gender IN (${genderStr})`);
    if (ageStr) personConditions.push(`p.Age IN (${ageStr})`);

    // Location Filters
    if (locationStr) {
      const likeConditions = clean(Locations).map(
        (loc) => `l.name LIKE '%${loc.replace(/'/g, "''")}%'`
      );
      query += ` AND (${likeConditions.join(' OR ')})`;
    }

    // Date Filters (prefix match using LIKE)
    if (CaptureDates.length) {
      const dateConditions = clean(CaptureDates).map(
        (prefix) => `i.capture_date LIKE '${prefix.replace(/'/g, "''")}%'`
      );
      query += ` AND (${dateConditions.join(' OR ')})`;
    }

    // Event Filters
    if (eventStr) {
      query += ` AND e.id IN (${eventStr})`;
    }

    // Person or Linked Person Logic — only if person filters exist
    if (personConditions.length > 0) {
      const personWhere = personConditions.join(' AND ');
      query += `
        AND (
          (${personWhere})
          OR p.id IN (
            SELECT person2_id FROM person_links WHERE person1_id IN (
              SELECT id FROM person WHERE ${personWhere}
            )
            UNION
            SELECT person1_id FROM person_links WHERE person2_id IN (
              SELECT id FROM person WHERE ${personWhere}
            )
          )
        )
      `;
    }

    query += ` ORDER BY i.capture_date DESC;`;

    // console.log('🔍 Final Query:\n', query);

    db.transaction((tx) => {
      tx.executeSql(
        query,
        [],
        (_, { rows }) => {
          const images = [];
          for (let i = 0; i < rows.length; i++) {
            images.push({
              id: rows.item(i).id,
              path: rows.item(i).path,
              capture_date: rows.item(i).capture_date,
              location_id: rows.item(i).location_id,
            });
          }
          resolve(images);
        },
        (_, error) => {
          console.error('❌ SQLite query error:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};
