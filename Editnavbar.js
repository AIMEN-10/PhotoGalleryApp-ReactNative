import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  InteractionManager,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import colors from './theme/colors';
import Editscreen from './Editscreen';

const Tab = createBottomTabNavigator();
const SCREEN_HEIGHT = Dimensions.get('window').height;

const Editnavbar = () => {
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
        { text: 'Delete Image', onPress: () => showConfirmationAlert('Delete Image') },
        { text: 'Delete Metadata', onPress: () => showConfirmationAlert('Delete Metadata') },
      ],
      { cancelable: true }
    );
  };

  const [modalData, setModalData] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const openModal = () => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setModalData(null));
  };

  useEffect(() => {
    if (!modalData) return;
    const task = InteractionManager.runAfterInteractions(() => {
      openModal();
    });
    return () => task.cancel();
  }, [modalData]);

  return (
    <>
      {/* Bottom Sheet Modal */}
      {modalData && (
        <TouchableWithoutFeedback onPress={closeModal}>
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              zIndex: 99,
              justifyContent: 'flex-end',
            }}
          >
            <Animated.View
              style={{
                transform: [{ translateY }],
                backgroundColor: '#fff',
                maxHeight: SCREEN_HEIGHT * 0.7,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingBottom: 20,
              }}
            >
              <View style={{ padding: 16, alignItems: 'flex-end' }}>
                {/* <TouchableOpacity onPress={closeModal}>
                  <Text style={{ fontSize: 18, color: colors.primary }}>Close</Text>
                </TouchableOpacity> */}
              </View>

              <ScrollView
                style={{ paddingHorizontal: 20 }}
                contentContainerStyle={{ paddingBottom: 40 }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: colors.dark,
                    marginBottom: 10,
                  }}
                >
                  {modalData.type === 'info'
                    ? 'Info'
                    : modalData.type === 'edit'
                    ? 'Edit'
                    : modalData.type === 'details'
                    ? 'Details'
                    : 'Modal'}
                </Text>

                {typeof modalData.content === 'function' ? (
                  React.createElement(modalData.content)
                ) : (
                  <Text style={{ marginTop: 10 }}>{modalData.content}</Text>
                )}
              </ScrollView>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      )}

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
              tabBarButton: ({ onPress }) => (
                <TouchableOpacity
                  onPress={(event) => {
                    event.persist();
                    setTimeout(() => {
                      console.log('Touch:', event.nativeEvent);
                    }, 100);

                    setActiveTab(name);

                    if (isDelete) {
                      showDeletePopup();
                    } else if (name === 'Info') {
                      setModalData({ type: 'info', content: 'Info-related content here.' });
                    } else if (name === 'Edit') {
                      setModalData({ type: 'edit', content: Editscreen });
                    } else if (name === 'Details') {
                      setModalData({ type: 'details', content: 'Details content here.' });
                    } else {
                      onPress?.();
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
