import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Editscreen from './Editscreen';
import Detailsscreen from './Detailsscreen';
import Deletescreen from './Deletescreen';
import colors from './theme/colors';

const Tab = createBottomTabNavigator();

const Editnavbar = () => {
  const [isInfoTabVisible, setIsInfoTabVisible] = useState(false); // Conditionally show the "Info" tab

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarIconStyle: { width: 30, height: 30 },
        tabBarLabelStyle: { fontSize: 15 },
        tabBarStyle: {
          height: 60,
          backgroundColor: colors.primary,
          borderColor: colors.dark,
          borderWidth: 1,
          borderTopColor: colors.secondary,
          borderBottomColor: colors.dark,
          borderTopLeftRadius: 35,
          borderTopRightRadius: 35,
          shadowColor: colors.dark,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 5,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: colors.dark,
        tabBarInactiveTintColor: colors.secondary,
      }}
    >
      <Tab.Screen
        name="Edit"
        component={Editscreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="edit" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Details"
        component={Detailsscreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="list" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Delete"
        component={Deletescreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="delete" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Info"
        component={Deletescreen} // You can replace this with another screen
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="info" size={size} color={color} />
          ),
          tabBarStyle: {
            // Hides the "Info" tab without taking up space
            display: isInfoTabVisible ? 'flex' : 'none', 
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default Editnavbar;
