import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import React from 'react';
import {View} from 'react-native';

const Location=()=>{

    return(
<View>
<GooglePlacesAutocomplete
      placeholder='Search'
      onPress={(data, details = null) => {
        // 'details' is provided when fetchDetails = true
        console.log(data, details);
      }}
      query={{
        key: 'YOUR API KEY',
        language: 'en',
      }}
    />
</View>


    )
};
export default Location;