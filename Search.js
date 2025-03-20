import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Pressable, TextInput, ScrollView, TouchableOpacity, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Checkbox, Chip } from 'react-native-paper';
import colors from './theme/colors';
import Allcontrols from './Allcontrols';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';


const Search = ({ route }) => {
  const { data } = route.params || {};
  const [name, setName] = useState('');
  const [visible, setVisible] = useState(true);

  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios' ? true : false); // Hide the picker on Android after selection
    setDate(currentDate);
  };

  const showDatepicker = () => {
    setShow(true);
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Adding leading 0 for months < 10
    const day = String(date.getDate()).padStart(2, '0'); // Adding leading 0 for days < 10
    return `${year}-${month}-${day}`;
  };
  return (
    <ScrollView>
      <View style={styles.allControlsContainer}>
        <Allcontrols text={data}></Allcontrols>
      </View>
      <View style={styles.contentContainer}>

        <View style={styles.nameContainer}>
          <Text style={styles.text}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={(text) => setName(text)} // Update state on text change
            placeholder="Enter name"
            placeholderTextColor={colors.grey}
          />
          <Icon name="check-circle" size={30} color={colors.primary} />
        </View>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} // Hides scroll bar
          contentContainerStyle={{ flexDirection: 'row', gap: 10, paddingHorizontal: 10 }} // ✅ Proper row layout
        >
          {visible && (
            <Chip
              onPress={() => console.log('Pressed')}
              onClose={() => {
                setVisible(false);
                console.log('Chip Closed');
              }}
              style={styles.chip}
              textStyle={{ color: colors.secondary }}  // Text color
              closeIconColor={colors.secondary || 'black'} // Custom color for close icon (Red)
            >
              Aimen
            </Chip>
          )}
          <Chip onPress={() => console.log('Pressed')}
            onClose={() => console.log('Chip Closed')}
            style={styles.chip}
          >Eman</Chip>
          <Chip onPress={() => console.log('Pressed')}
            onClose={() => console.log('Chip Closed')}
            style={styles.chip}
          >Eman</Chip>
          <Chip onPress={() => console.log('Pressed')}
            onClose={() => console.log('Chip Closed')}
            style={styles.chip}
          >Eman</Chip>
          <Chip onPress={() => console.log('Pressed')}
            onClose={() => console.log('Chip Closed')}
            style={styles.chip}
          >Eman</Chip>
        </ScrollView>
        <View >
          <Text style={styles.text}>Gender</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>

            <Checkbox

            />
            <Text style={{ fontSize: 18, color: colors.dark }}>Male</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

              <Checkbox

              />
              <Text style={{ fontSize: 18, color: colors.dark }}>Female</Text>
            </View>
          </View>
        </View>

        <View >

          <Text style={styles.text}>Events</Text>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Checkbox

              />
              <Text style={{ fontSize: 18, color: colors.dark }}>Birthday</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

              <Checkbox

              />
              <Text style={{ fontSize: 18, color: colors.dark }}>Convocation</Text>
            </View>
          </View>
        </View>
        <View >

          <Text style={styles.text}>Capture Date</Text>

          <Text style={{ fontSize: 18, marginVertical: 20, backgroundColor: colors.dark }}>
            {formatDate(date)}
          </Text>

          <Icon
            name="event"  
            size={30} 
            color={colors.primary}
            onPress={showDatepicker} 
            style={{ marginBottom: 20 }} 
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
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  text: {
    color: colors.dark,
    fontSize: 18,
    fontWeight: 'bold'
  },
  allControlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,// Adjusts spacing between controls and the image container
  },
  contentContainer: {
    // flex: 1, 
    marginTop: 80,
    padding: 10,
  },
  nameContainer: {
    flexDirection: 'row', // To display the label and input next to each other
    alignItems: 'center', // Vertically align the text and input
    marginVertical: 20, // Space between sections
    gap: 20
  },
  input: {
    borderBottomWidth: 1, // Creates the underline
    borderBottomColor: colors.dark, // Set the color for the underline
    paddingVertical: 5, // Vertical padding for the input field
    flex: 1, // Take the remaining space for the input
    fontSize: 16, // Adjust font size for input text
    color: colors.dark
  },
  chip: {
    backgroundColor: colors.primary, // Light grey background
    alignSelf: 'flex-start', // Make it adjust based on content width

  },

});

export default Search;
