import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Addmetadata from './Addmetadata';
import colors from './theme/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Bottom Tab Navigator
const Tab = createBottomTabNavigator();

const Bottomnavigation = () => {
  return (
    <Tab.Navigator 
  initialRouteName="Label"
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
  name="Label" 
  component={Addmetadata} 
  
  initialParams={{ data: 'Label' }}
  options={{
    // tabBarIcon: ({ color, size }) => (
    //   <Image 
    //     source={require('./src/images/label.png')} // Replace with your image path
    //     style={{ width: size, height: size, tintColor: color }} 
    //   />
   
      tabBarIcon: ({ color, size }) => (
        <Icon name="broken-image" size={size} color={color} /> // Change the name as needed
      
    ),
  }} 
  
/>

<Tab.Screen 
  name="Person" 
  component={Addmetadata} 
  options={{
    tabBarIcon: ({ color, size }) => (
      <Icon name="people" size={size} color={color} /> // Change the name as needed
    ),
  }}
  initialParams={{ data: 'Person' }}  
/>

<Tab.Screen 
  name="Event" 
  component={Addmetadata} 
  options={{
    tabBarIcon: ({ color, size }) => (
      <Icon name="celebration" size={size} color={color} /> // Change the name as needed
    ),
  }} 
  initialParams={{ data: 'Event' }} 
/>
    <Tab.Screen 
      name="Location" 
      component={Addmetadata} 
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="location-on" size={size} color={color} /> // Change the name as needed
        ),
      }}
      initialParams={{ data: 'Location' }} 
    />
    <Tab.Screen 
      name="Date" 
      component={Addmetadata} 
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="date-range" size={size} color={color} /> // Change the name as needed
        ),
         
      }}
      initialParams={{ data: 'Date' }} 
    />
    {/* <Tab.Screen 
        name="Home" 
        component={MainStack} 
        options={{
          tabBarLabel: 'Home',  // If you want to keep the label
          tabBarButton: () => null// This hides the Home tab from BottomTab
        }}  
      /> */}
  </Tab.Navigator>  );
};

export default Bottomnavigation;
