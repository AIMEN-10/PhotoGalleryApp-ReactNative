import React,{ useState, useEffect} from 'react';
import { View, StyleSheet, Image, Text, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import colors from './theme/colors';
import {getagewise,getAllEvents} from './Databasequeries'
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import Images from './Models/Image';
const Newscreen=({route})=>{
    const { data } = route.params || {};
      const [eventData, setEventData] = useState([]);
    
    const navigation = useNavigation();
    console.log({data})
 const SearchImages=async(value)=>{
    console.log("this way");
const personage=await getagewise(data);
console.log(personage);
navigation.navigate('Images', { data: "Person"+personage.map(p=>p.DOB) + ';'+ personage.map(p=>p.id)+';'+value});
  console.log("ok")

 }

useEffect(() => {
 const fetchEvents = async () => {
      try {
        const events = await getAllEvents(); // Fetch events from the database
        const formattedData = events.map(event => 
           event.name,
        );
        console.log(formattedData);
        setEventData(formattedData); // Store events
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };
fetchEvents();
}
)
    
return(
<View>
   <Button
               mode="contained"
               style={styles.button}
               labelStyle={styles.buttonText}
               onPress={()=>{SearchImages("Childhood")}}
             >
              Childhood
             </Button>

             <Button
                         mode="contained"
                         style={styles.button}
                         labelStyle={styles.buttonText}
                         onPress={()=>{SearchImages("Teenage")}}
                       >
                         Teenager
                       </Button>
                       <Button
                                   mode="contained"
                                   style={styles.button}
                                   labelStyle={styles.buttonText}
                                   onPress={()=>{SearchImages("Adult")}}
                                 >
                                   Adulthood
                                 </Button>
                                 {eventData.map(event => (
            <View key={event.key} style={styles.checkboxContainer}>
              
              <Button
                          mode="contained"
                          style={styles.button}
                          labelStyle={styles.buttonText}
                          
                        >
                {event}
                </Button>
            </View>
          ))}
                                 
{/* {eventData.length &&(
    
    <Button
     mode="contained"
                                   style={styles.button}
                                   labelStyle={styles.buttonText}>
        {eventData}
    </Button>

)} */}
</View>


)
}
const styles = StyleSheet.create({
 button: {
    backgroundColor: colors.primary,
    borderColor: colors.dark,
    borderWidth: 1,
  },
  buttonText: {
    color: colors.dark,
  },
});
export default Newscreen;