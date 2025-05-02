import React, { useState, useEffect ,useRef} from 'react';
import { View, Text, StyleSheet, TextInput, Image, BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RadioButton } from 'react-native-paper';
import colors from './theme/colors';

const PersonInfo = ({ route }) => {
 // const { imageDetails, onGoBack } = route.params;
 //const route = useRoute();
 const { imageDetails } = route.params;

  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  
  const navigation = useNavigation();
  const hasSentData = useRef(false);
  


  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Only send data if not already sent
        if (!hasSentData.current) {
          hasSentData.current = true;
           // Go back to the previous screen

          // Send data back and navigate to 'Edit' screen
          navigation.navigate('Edit', {
            imageId: imageDetails[0].id,
            personData: {
              name,
              gender,
              personPath: imageDetails?.[0]?.person_path || '',
            },
          });
          navigation.goBack();
          
        }
      };

      // Listen for hardware back press
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Cleanup listener on unmount
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [name, gender, imageDetails, navigation]) // Add navigation as dependency
  );
  
  // Send data back on unmount (if not already sent)
  useEffect(() => {
    return () => {
      if (!hasSentData.current) {
        navigation.navigate('Edit', {
          imageId: imageDetails[0].id,
          personData: {
            name,
            gender,
            personPath: imageDetails?.[0]?.person_path || '',
          },
        });
        hasSentData.current = true;
      }
    };
  }, []);
  
  
  
  // useEffect(() => {
  //   return () => {
  //     if (!hasSentData.current && onGoBack) {
  //       onGoBack({ name, gender,  personPath: imageDetails?.[0]?.person_path || '',
  //       });
  //       hasSentData.current = true;
  //     }
  //   };
  // }, []);
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Name Person</Text>
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: baseUrl+imageDetails[0].person_path }}
            style={{ height: 100, width: '100%' }}
          />
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Enter Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
          <View style={styles.radioGroup}>
            <View style={styles.radioButton}>
              <RadioButton
                value="Male"
                status={gender === 'Male' ? 'checked' : 'unchecked'}
                onPress={() => setGender('Male')}
                color={colors.dark}
                uncheckedColor={colors.dark}
              />
              <Text style={styles.label}>Male</Text>
            </View>
            <View style={styles.radioButton}>
              <RadioButton
                value="Female"
                status={gender === 'Female' ? 'checked' : 'unchecked'}
                onPress={() => setGender('Female')}
                color={colors.dark}
                uncheckedColor={colors.dark}
              />
              <Text style={styles.label}>Female</Text>
            </View>
          </View>
        </View>
      </View>
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
