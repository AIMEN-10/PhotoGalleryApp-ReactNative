import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Image, BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RadioButton } from 'react-native-paper';
import colors from './theme/colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';


const PersonInfo = ({ route }) => {
  const { imageDetails, screen } = route.params;
  const navigation = useNavigation();
  const hasSentData = useRef(false);
  const [dates, setDates] = useState({});
  const [showIndex, setShowIndex] = useState(null);

  const [persons, setPersons] = useState([]);
  const [show, setShow] = useState(false);


  const onChange = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setShowIndex(null);
      return;
    }

    const currentDate = selectedDate || new Date();

    // Update separate dates state (if you still need it)
    const updatedDates = { ...dates };
    updatedDates[showIndex] = currentDate;
    setDates(updatedDates);

    // ✅ Also update DOB in persons array
    const updatedPersons = [...persons];
    updatedPersons[showIndex].DOB = formatDate(currentDate);
    setPersons(updatedPersons);

    setShowIndex(null);
  };


  const showDatepicker = (index) => {
    setShowIndex(index);
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const currentDateFormatted = formatDate(new Date());

  // Initialize persons state from imageDetails
  useEffect(() => {
    if (imageDetails && imageDetails.length > 0) {
      console.log(persons)
      const initializedPersons = imageDetails.map((person) => ({
        id: person.person_id,
        path: person.person_path,
        name: person.person_name || '',
        gender: person.gender || 'Male',
        DOB: person.DOB || ''
      }));
      setPersons(initializedPersons);
    }
  }, [imageDetails]);

  // Handle Android back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (!hasSentData.current) {
          hasSentData.current = true;

          const personData = persons.map((person) => ({
            id: person.id,
            name: person.name || 'Unknown',
            gender: person.gender || 'U',
            personPath: person.path || '',
            DOB: person.DOB || ''
          }));

          route.params?.onGoBack?.(personData);
          navigation.goBack();
        }

        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [persons])
  );

  // Handlers to update individual name and gender
  const updateName = (index, newName) => {
    const updated = [...persons];
    updated[index].name = newName;
    setPersons(updated);
  };

  const updateGender = (index, newGender) => {
    const updated = [...persons];
    updated[index].gender = newGender;
    setPersons(updated);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Name Person</Text>
      {persons.map((person, index) => (

        <View key={person.id || index} style={styles.card}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: baseUrl + person.path }}
              style={{ height: 100, width: '100%' }}
            />
          </View>
          <View style={styles.formContainer}>
            <Text style={styles.label}>Enter Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#999"
              value={person.name}
              onChangeText={(text) => updateName(index, text)}
            />

            <View style={styles.radioGroup}>
              <View style={styles.radioButton}>
                <RadioButton
                  value="M"
                  status={person.gender === 'M' ? 'checked' : 'unchecked'}
                  onPress={() => updateGender(index, 'M')}
                  color={colors.dark}
                  uncheckedColor={colors.dark}
                />
                <Text style={styles.label}>Male</Text>
              </View>
              <View style={styles.radioButton}>
                <RadioButton
                  value="F"
                  status={person.gender === 'F' ? 'checked' : 'unchecked'}
                  onPress={() => updateGender(index, 'F')}
                  color={colors.dark}
                  uncheckedColor={colors.dark}
                />
                <Text style={styles.label}>Female</Text>
              </View>
              <View style={styles.radioButton}>
                <RadioButton
                  value="U"
                  status={person.gender === 'U' ? 'checked' : 'unchecked'}
                  onPress={() => updateGender(index, 'U')}
                  color={colors.dark}
                  uncheckedColor={colors.dark}
                />
                <Text style={styles.label}>Other</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'column' }}>
              <Text style={styles.label}>Date of Birth:</Text>

              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.label}>
                  {person.DOB ? person.DOB : 'Select Date'}
                </Text>


                <Icon name="event" size={30} color={colors.dark} onPress={() => showDatepicker(index)} />

                {showIndex === index && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={dates[index] || new Date()}
                    mode="date"
                    is24Hour={true}
                    display={Platform.OS === 'android' ? 'spinner' : 'spinner'}
                    onChange={onChange}
                    maximumDate={new Date()}
                  />

                )}

                {/* {show && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={onChange}
                  />
                )} */}
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.secondary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.dark,
  },
  card: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginBottom: 20,
  },
  imageContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginRight: 10,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: colors.dark,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.dark,
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
    backgroundColor: colors.secondary,
    color: colors.dark,
  },
  radioGroup: {
    flexDirection: 'col',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
});

export default PersonInfo;
