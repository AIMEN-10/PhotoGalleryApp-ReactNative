import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconButton, MD3Colors } from 'react-native-paper';
import colors from './theme/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SelectDropdown from 'react-native-select-dropdown';
import { useNavigation } from '@react-navigation/native';
import { Menu, Divider } from 'react-native-paper';

const Allcontrols = ({ text }) => {

  
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);
  const handleIconPress = (item) => {
    console.log("Navigating to screen:", item);
    navigation.navigate(item, { data:item }); 
    setVisible(false)
  };
  return (
    <View style={{ backgroundColor: colors.primary }}>

      <View style={styles.uppertext}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.heading}>{text}</Text>
          <Menu
            visible={visible}
            onDismiss={() => setVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setVisible(true)}>
                <Icon name="more-vert" size={40} color={colors.dark} />
              </TouchableOpacity>
            }
            contentStyle={styles.menuContent} 
          >
            
              
              <Menu.Item
                leadingIcon="magnify"
                title="Search"
                onPress={() => {handleIconPress("Search")}}
                titleStyle={styles.menuText}
              />

              <Divider />

              
              <Menu.Item
                leadingIcon="sync"
                title="Sync"
                onPress={() => { /* Define Sync Action */ }}
                titleStyle={styles.menuText}
              />

              <Divider />

              {/* Menu Item with Undo Icon */}
              <Menu.Item
                leadingIcon="undo"
                title="Undo Changes"
                onPress={() => { /* Define Undo Action */ }}
                titleStyle={styles.menuText}
              />

              

              
            </Menu>
        </View>

        <View style={[styles.circle, { backgroundColor: colors.secondary }]}>

        </View>


      </View>
    </View>
  );
};

const styles = StyleSheet.create({

  heading: {
    fontSize: 25,
    margin: 10,
    paddingLeft: 20,
    color: colors.dark
  },
  circle: {
    bordercolor: colors.dark,
    borderWidth: 1,
    borderRadius: 50,
    height: 700,

  },
  uppertext: {
    margin: 5,

  },
  menuContent: {
    backgroundColor: colors.secondary, // ✅ Menu background color
    borderRadius: 10, // ✅ Rounded corners for smooth look
    paddingVertical: 5, // ✅ Better spacing
    bordercolor:colors.dark,
    borderWidth:1
  },
  menuText: {
    color: colors.dark, // ✅ Menu text color
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Allcontrols;
