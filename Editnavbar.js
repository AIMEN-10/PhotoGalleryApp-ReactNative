import React ,{useEffect} from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Addmetadata from './Addmetadata';
import colors from './theme/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Editscreen from './Editscreen';
import Detailsscreen from './Detailsscreen';
import Deletescreen from './Deletescreen';
import { useNavigation } from '@react-navigation/native';

// Bottom Tab Navigator
const Tab = createBottomTabNavigator();

const Editnavbar = () => {
  const navigation = useNavigation(); 
  // useEffect(() => {
  //   navigation.reset({
  //     index: 0,
  //     routes: [{ name: 'ViewPhoto' }], // Prevents a tab from being auto-selected
  //   });
  // }, [navigation]);
  return (
    <Tab.Navigator 
  // initialRouteName="Label"
  screenOptions={{
    headerShown: false,
    tabBarIconStyle: { width: 30, height: 30 }, // Adjust icon size
    tabBarLabelStyle: { fontSize: 15 }, // Adjust text size
    tabBarStyle: { 
      height: 60, // Adjust height of tab bar
      backgroundColor: colors.primary, // Set background color
      borderColor: colors.dark, // Apply border color to the whole navbar
      borderWidth: 1, // Apply border to all sides (adjust thickness)
      borderTopColor: colors.secondary, // Set the color of the top border
      borderBottomColor: colors.dark, // Ensure the bottom also has the correct color
      borderTopLeftRadius: 35, // Round top-left corner
      borderTopRightRadius: 35, // Round top-right corner
      shadowColor: colors.dark, // Shadow color
      shadowOffset: { width: 0, height: -4 }, // Shadow offset
      shadowOpacity: 0.1, // Shadow opacity
      shadowRadius: 5,
      elevation: 5, // For Android shadow effect
      position: 'absolute', // Keep the tab bar on top without affecting the content
      bottom: 0, // Keep the tab bar at the bottom of the screen
      left: 0, // Ensure the tab bar stretches across the full width of the screen
      right: 0, // Ensure the tab bar stretches across the full width of the screen
    },
    
    tabBarActiveTintColor: colors.dark, // Active icon and text color
    tabBarInactiveTintColor: colors.secondary, // Inactive icon and text color
  }}
>


<Tab.Screen 
  name="Edit" 
  component={Editscreen} 
  options={{
    tabBarIcon: ({ color, size }) => (
      <Icon name="edit" size={size} color={color} /> // Edit icon
    ),
  }}
  initialParams={{ data: 'Edit' }}  
/>

<Tab.Screen 
  name="Details" 
  component={Detailsscreen} 
  options={{
    tabBarIcon: ({ color, size }) => (
      <Icon name="list" size={size} color={color} /> // Details icon
    ),
  }}
  initialParams={{ data: 'Details' }}  
/>

<Tab.Screen 
  name="Delete" 
  component={Deletescreen} 
  options={{
    tabBarIcon: ({ color, size }) => (
      <Icon name="delete" size={size} color={color} /> // Delete icon
    ),
  }}
  initialParams={{ data: 'Delete' }}  
/>
  </Tab.Navigator>  
  );
};

export default Editnavbar;
