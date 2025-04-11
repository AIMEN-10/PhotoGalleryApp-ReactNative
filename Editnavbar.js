import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Modalize } from 'react-native-modalize';
import { ScrollView } from 'react-native-gesture-handler';
import colors from './theme/colors'; // Adjust path accordingly
import Editscreen from './Editscreen';

const Tab = createBottomTabNavigator();

const StaticScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 20 }}>Same View Remains</Text>
  </View>
);

const showConfirmationAlert = (action) => {
  Alert.alert(
    'Confirm Deletion',
    `Are you sure you want to ${action}?`,
    [
      { text: 'Yes', onPress: () => console.log(`${action} Confirmed`) },
      { text: 'No', style: 'cancel', onPress: () => console.log(`${action} Cancelled`) },
    ],
    { cancelable: true }
  );
};

const showDeletePopup = () => {
  Alert.alert(
    'Delete Options',
    'What do you want to delete?',
    [
      { text: 'Delete Image', onPress: () => { showConfirmationAlert('Delete Image'); } },
      { text: 'Delete Metadata', onPress: () => { showConfirmationAlert('Delete Metadata'); } },
    ],
    { cancelable: true }
  );
};

// ✅ Function that returns Modalize component
const renderInfoModal = (infoSheetRef, modalData) => (
  <Modalize
    ref={infoSheetRef}
    snapPoint={400}
    modalHeight={600}
    handleStyle={{ backgroundColor: colors.primary }}
    modalStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20,borderColor:colors.primary,borderwidth:2 }}
  >
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.dark}}>
      {modalData?.type === 'info'
      ? 'Info'
      : modalData?.type === 'edit'
      ? 'Edit'  // Display the 'Edit' heading (or customize this)
      : modalData?.type === 'details'
      ? 'Details'
      : 'Modal'} </Text>
      
      {modalData?.type === 'edit' && modalData.content && (
    <modalData.content />
  )}
    </ScrollView>
  </Modalize>
);
// const handleDetailsPress = () => {
//   setModalData({ type: 'details', content: 'This is details content.' });
//   infoSheetRef.current?.open();
// };

// const handleEditPress = () => {
//   setModalData({ type: 'edit', content: <Editscreen/> });
//   infoSheetRef.current?.open();
// };
// const handleInfoPress = () => {
//   setModalData({ type: 'info', content: 'This is info-related content.' });
//   infoSheetRef.current?.open();
// };
const Editnavbar = () => {
  const [modalData, setModalData] = useState(null);

  const [activeTab, setActiveTab] = useState(null);
  const infoSheetRef = useRef(null);

  
  

  return (
    <>
      {/* ✅ Call the reusable function here */}
      {renderInfoModal(infoSheetRef, modalData)}


      {/* Bottom Tab Navigation */}
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
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
        }}
      >
        {[
          { name: 'Edit', icon: 'edit' },
          { name: 'Details', icon: 'list' },
          { name: 'Delete', icon: 'delete', isDelete: true },
          { name: 'Info', icon: 'info' },
        ].map(({ name, icon, isDelete }) => (
          <Tab.Screen
            key={name}
            name={name}
            component={StaticScreen}
            options={{
              tabBarButton: ({ onPress, ...rest }) => (
                <TouchableOpacity 

                {...rest}
                  onPress={() => {
                   
                    setActiveTab(name);
                    if (isDelete) {
                      showDeletePopup();
                    } else if (name === 'Info') {
                      setModalData({ type: 'info', content: 'Info-related content here.' });
                      infoSheetRef.current?.open();
                    }else if (name === 'Edit') {
                      setModalData({ type: 'edit', content: Editscreen });
                      infoSheetRef.current?.open();
                    } else if (name === 'Details') {
                      setModalData({ type: 'details', content: 'Details content here.' });
                      infoSheetRef.current?.open();
                    } 
                    else {
                      onPress?.(); // ✅ Call the default onPress cleanly
                    }
                  }}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 30,
                    paddingTop: 5,
                  }}
                >
                  <Icon
                    name={icon}
                    size={30}
                    color={activeTab === name ? colors.dark : colors.secondary}
                  />
                  <Text
                    style={{
                      fontSize: 15,
                      color: activeTab === name ? colors.dark : colors.secondary,
                      marginTop: 2,
                    }}
                  >
                    {name}
                  </Text>
                </TouchableOpacity>
              ),
            }}
          />
        ))}
      </Tab.Navigator>
    </>
  );
};

export default Editnavbar;
