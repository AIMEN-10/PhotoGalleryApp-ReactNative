import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { Menu, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import colors from './theme/colors';
import { markImageAsDeleted } from './Databasequeries'; // Adjust the import based on your file structure

const Allcontrols = ({ text, selectMode, selectedItems = [], onBulkEdit,  onRefresh }) => {
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);

  const handleIconPress = (item) => {
    navigation.navigate(item, { data: item });
    setVisible(false);
  };

  return (
    <View style={styles.main}>
      <View style={styles.uppertext}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.heading}>{text}</Text>

          {!selectMode || !onBulkEdit ? (

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
                onPress={() => handleIconPress("Search")}
                titleStyle={styles.menuText}
              />
              <Divider />
              <Menu.Item
                leadingIcon="sync"
                title="Sync"
                onPress={() => handleIconPress("Sync")}
                titleStyle={styles.menuText}
              />
              <Divider />
              <Menu.Item
                leadingIcon="undo"
                title="Undo Changes"
                onPress={() => handleIconPress("Undo")}
                titleStyle={styles.menuText}
              />
            </Menu>
          ) : (
            selectedItems.length > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                <TouchableOpacity
                  style={[styles.bulkEditButton, { flexDirection: 'row', alignItems: 'center', marginRight: 10 }]}
                  onPress={() => {
                    selectedItems.forEach((id) => markImageAsDeleted(id)); // <-- Call your delete function
                  onRefresh?.(); 
                  }}
                >
                  <Icon name="delete" size={20} color={colors.dark} style={{ marginRight: 5 }} />
                  <Text style={styles.bulkEditButtonText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bulkEditButton} 
                // onPress={onBulkEdit}>
                onPress={() => {
  onBulkEdit?.(); // perform bulk edit
  onRefresh?.();  // refresh the view
}}>
                  <Text style={styles.bulkEditButtonText}>Bulk Edit ({selectedItems.length})</Text>
                </TouchableOpacity>
              </View>)
          )}
        </View>


        <View style={[styles.circle, { backgroundColor: colors.secondary }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    backgroundColor: colors.primary, // Adds transparency (AA ≈ 66% opacity)
  }

  ,
  heading: {
    fontSize: 25,
    margin: 10,
    paddingLeft: 20,
    color: colors.dark,
  },
  circle: {
    borderColor: colors.dark,
    borderWidth: 1,
    borderRadius: 50,
    height: 700,
  },
  uppertext: {
    margin: 5,
  },
  menuContent: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    paddingVertical: 5,
    borderColor: colors.dark,
    borderWidth: 1,
  },
  menuText: {
    color: colors.dark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  bulkEditButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  bulkEditButtonText: {
    color: colors.dark,
    fontWeight: 'bold',
  },
});

export default Allcontrols;
