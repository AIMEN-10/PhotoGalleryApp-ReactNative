import React, { useState } from 'react';
import { View, Text, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const GOOGLE_PLACES_API_KEY = ''; // Put your actual key here

const Location = () => {
  const [selectedPlace, setSelectedPlace] = useState('');

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, padding: 16 }}>
          <GooglePlacesAutocomplete
            placeholder='Search'
            fetchDetails={true}
            onPress={(data, details = null) => {
              setSelectedPlace(data.description);
              console.log('Selected Place:', data, details);
            }}
            query={{
              key: GOOGLE_PLACES_API_KEY,
              language: 'en',
            }}
            minLength={2}
            enablePoweredByContainer={false}
            styles={{
              container: {
                flex: 0,
                zIndex: 10,
              },
              textInput: {
                height: 40,
                borderColor: '#ccc',
                borderWidth: 1,
                borderRadius: 4,
                paddingHorizontal: 10,
                color: '#000', // black text
                backgroundColor: '#fff', // white background
              },
              listView: {
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#ddd',
                zIndex: 1000,
                elevation: 3,
              },
            }}
          />

          {selectedPlace ? (
            <Text style={{ marginTop: 20, fontSize: 16 }}>
              Selected: {selectedPlace}
            </Text>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Location;
