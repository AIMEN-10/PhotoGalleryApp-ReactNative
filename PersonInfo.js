import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Image, BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RadioButton } from 'react-native-paper';
import colors from './theme/colors';


const PersonInfo = ({ route }) => {
  const { imageDetails, screen } = route.params;
  const navigation = useNavigation();
  const hasSentData = useRef(false);

  const [persons, setPersons] = useState([]);

  // Initialize persons state from imageDetails
  useEffect(() => {
    if (imageDetails && imageDetails.length > 0) {
      const initializedPersons = imageDetails.map((person) => ({
        id: person.person_id,
        path: person.person_path,
        name: person.person_name || '',
        gender: person.gender || 'Male',
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
                  value="Male"
                  status={person.gender === 'Male' ? 'checked' : 'unchecked'}
                  onPress={() => updateGender(index, 'Male')}
                  color={colors.dark}
                  uncheckedColor={colors.dark}
                />
                <Text style={styles.label}>Male</Text>
              </View>
              <View style={styles.radioButton}>
                <RadioButton
                  value="Female"
                  status={person.gender === 'Female' ? 'checked' : 'unchecked'}
                  onPress={() => updateGender(index, 'Female')}
                  color={colors.dark}
                  uncheckedColor={colors.dark}
                />
                <Text style={styles.label}>Female</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
});

export default PersonInfo;
