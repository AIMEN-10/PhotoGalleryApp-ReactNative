import React, { useEffect } from 'react';
import { View, Image, PermissionsAndroid, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Addmetadata from './Addmetadata';
import { LogBox } from 'react-native';
import ViewPhoto from './ViewPhoto';
import Images from './Images';
import Folders from './Folders';
import Editnavbar from './Editnavbar';
import Search from './Search';
import Sync from './Sync';
import Undo from './Undo';
import Undo_details from './Undo_details';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Editscreen from './Editscreen';
import PersonInfo from './PersonInfo';
import Login2 from './LogIn2';
import Signup from './SignUp';
import Home from './Home';
import Test from './test';
import Location from './Location';
import Checkbox_example from './Checkbox_example';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Groupbylocation from './Groupbylocation';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import colors from './theme/colors';
import Bottomnavigation from './Bottomnavigation';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
import { Provider as PaperProvider, Searchbar } from 'react-native-paper';
import { enableScreens } from 'react-native-screens';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MultipleEvents from './MultipleEvents';
import TaskFolders from './TaskFolders';
import Addmetadatatask from './Addmetadatatask';
import Drag from './Drag';
import Searchfilters from './Searchfilters';
import Newscreen from './Newscreen';

LogBox.ignoreAllLogs(true); // Ignore all log notifications
const MainStack = () => (
  <PaperProvider>
    <Stack.Navigator>
      <Stack.Screen
        name="navbar"
        component={Bottomnavigation}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="secondnavbar"
        component={Editnavbar}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ViewPhoto"
        component={ViewPhoto}
        options={{ headerShown: false, lazy: true }}
      />
      <Stack.Screen

        name="Gallery"
        component={Addmetadata}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Folders"
        component={Folders}
        options={{ headerShown: false, lazy: true }}
      />
      <Stack.Screen
        name="Images"
        component={Images}
        options={{ headerShown: false, lazy: true }}
      />
      <Stack.Screen
        name="TaskFolders"
        component={TaskFolders}
        options={{ headerShown: false, lazy: true }}
      />

      <Stack.Screen
        name="Search"
        component={Search}
        options={{ headerShown: false, lazy: true }}
      />
      <Stack.Screen
        name="Sync"
        component={Sync}
        options={{ headerShown: false, lazy: true }}
      />
      <Stack.Screen
        name="Undo"
        component={Undo}
        options={{ headerShown: false, lazy: true }}
      />
      <Stack.Screen
        name="Undo_details"
        component={Undo_details}
        options={{ headerShown: false, lazy: true }}
      />
      <Stack.Screen
        name="Edit"
        component={Editscreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen name="PersonInfo"
        component={PersonInfo}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Newscreen"
        component={Newscreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="MultipleEvents"
        component={MultipleEvents}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Searchfilters" 
        component={Searchfilters}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Addmetadatatask" 
        component={Addmetadatatask}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditModal"
        component={Editscreen}
        options={{
          presentation: 'modal', // Transparent background for modal
          headerShown: false, // Hide the header
          cardStyle: {
            margintop: 50,
            padding: 50,
          },
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                // Slide from bottom with translation
                transform: [
                  {
                    translateY: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.height, 0], // Slide from bottom
                    }),
                  },
                ],
                opacity: current.progress, // Fade-in effect as the modal slides
                backgroundColor: 'transparent', // Ensure background is transparent
              },
            };
          },
        }}
      />


      {/* <Stack.Screen 
          name="Placeholder" 
          component={PlaceholderScreen} 
          options={{ headerShown: false }} 
        /> */}

    </Stack.Navigator>
  </PaperProvider>
);
const App = () => {
  const Stack = createNativeStackNavigator();
  global.baseUrl = 'http://192.168.43.155:5000/';

  // useEffect(() => {
  //   requestImagePermission();
  // }, []);

  // const requestImagePermission = async () => {
  //   try {
  //     if (Platform.OS === 'android') {
  //       if (Platform.Version >= 33) {
  //         const hasImages = await PermissionsAndroid.check(
  //           PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
  //         );

  //         if (!hasImages) {
  //           const granted = await PermissionsAndroid.request(
  //             PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
  //           );

  //           if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //             console.log('Image permission granted');
  //           } else {
  //             console.log('Image permission denied');
  //           }
  //         } else {
  //           console.log('Image permission already granted');
  //         }
  //       } else {
  //         // Android 12 and below
  //         const hasStorage = await PermissionsAndroid.check(
  //           PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
  //         );

  //         if (!hasStorage) {
  //           const granted = await PermissionsAndroid.request(
  //             PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
  //           );

  //           if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //             console.log('Storage permission granted');
  //           } else {
  //             console.log('Storage permission denied');
  //           }
  //         } else {
  //           console.log('Storage permission already granted');
  //         }
  //       }
  //     }
  //   } catch (err) {
  //     console.warn('Permission error:', err);
  //   }
  // };


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer >
        <MainStack />

      </NavigationContainer>
    </GestureHandlerRootView>


    // <NavigationContainer>
    //    <Stack.Navigator >

    //      <Stack.Screen 
    //       name="SignIn" 
    //       component={Signup} 
    //       options={{ headerShown: false }} // Hides the header for this screen
    //     />
    //      <Stack.Screen 
    //       name="LogIn" 
    //       component={Login2} 
    //       options={{ headerShown: false }} // Hides the header for this screen
    //     />

    //       <Stack.Screen name="Home" component={Home} />
    //    </Stack.Navigator>
    // </NavigationContainer>

    //Removed the unnecessary View wrapper here

    // <NavigationContainer>
    //   <Stack.Navigator >
    //     <Stack.Screen 
    //       name="Gallery" 
    //       component={Addmetadata} 
    //       options={{ headerShown: false }} // Hides the header for this screen
    //     />
    //     <Stack.Screen 
    //       name="Images" 
    //       component={Images} 
    //       options={{ headerShown: false }} // Hides the header for this screen
    //     />
    //     <Stack.Screen 
    //       name="ViewPhoto" 
    //       component={ViewPhoto} 
    //       options={{ headerShown: false }}
    //     />
    //      <Stack.Screen 
    //       name="Edit" 
    //       component={Editscreen} 
    //       options={{ headerShown: false }}
    //     />
    //   </Stack.Navigator>
    // </NavigationContainer>



    //   <Addmetadata/>
    //   <SafeAreaProvider>
    //   <Editnavbar />
    // </SafeAreaProvider>
    //<Editscreen></Editscreen>
    //<Test/>
    //<Location/>
  );
};

export default App;


//asg
// import React, { useState } from 'react';
// import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';

// const Stack = createStackNavigator();

// // Initializing Users Array
// const initialUsers = [
//   { name: 'John', email: 'john@example.com', gender: 'Male', password: '12345' },
//   { name: 'Jane', email: 'jane@example.com', gender: 'Female', password: '54321' },
//   { name: 'Bob', email: 'bob@example.com', gender: 'Male', password: 'password123' },
//   { name: 'Alice', email: 'alice@example.com', gender: 'Female', password: 'mysecurepass' },
//   { name: 'Charlie', email: 'charlie@example.com', gender: 'Male', password: 'charliepass' }
// ];

// // Sign In Screen Component
// const SignInScreen = ({ navigation, users, setCurrentUser }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [inputBackgroundColor, setInputBackgroundColor] = useState('white');

//   const handleSignIn = () => {
//     const user = users.find(u => u.email === email && u.password === password);
//     if (user) {
//       setCurrentUser(user);
//       navigation.navigate('Home');
//     } else {
//       setInputBackgroundColor('red');
//       Alert.alert('Error', 'Incorrect email or password');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Sign In</Text>
//       <TextInput
//         style={[styles.input, { backgroundColor: inputBackgroundColor }]}
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//       />
//       <TextInput
//         style={[styles.input, { backgroundColor: inputBackgroundColor }]}
//         placeholder="Password"
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//       />
//       <Button title="Sign In" onPress={handleSignIn} />
//       <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
//         <Text style={styles.link}>Sign Up</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// // Sign Up Screen Component
// const SignUpScreen = ({ navigation, setUsers }) => {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [gender, setGender] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');

//   const handleSignUp = () => {
//     if (password !== confirmPassword) {
//       Alert.alert('Error', 'Passwords do not match');
//       return;
//     }

//     const newUser = { name, email, gender, password };
//     setUsers(prevUsers => [...prevUsers, newUser]);
//     navigation.navigate('SignIn');
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Sign Up</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Name"
//         value={name}
//         onChangeText={setName}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Gender"
//         value={gender}
//         onChangeText={setGender}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Password"
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Confirm Password"
//         secureTextEntry
//         value={confirmPassword}
//         onChangeText={setConfirmPassword}
//       />
//       <Button title="Sign Up" onPress={handleSignUp} />
//     </View>
//   );
// };

// // Home Screen Component
// const HomeScreen = ({ currentUser, navigation }) => {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Home</Text>
//       <Text style={styles.info}>Name: {currentUser.name}</Text>
//       <Text style={styles.info}>Email: {currentUser.email}</Text>
//       <Text style={styles.info}>Gender: {currentUser.gender}</Text>
//       <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
//         <Text style={styles.link}>Log Out</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// // Main App Component
// const App = () => {
//   const [users, setUsers] = useState(initialUsers);
//   const [currentUser, setCurrentUser] = useState(null);

//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="SignIn">
//         <Stack.Screen name="SignIn">
//           {props => <SignInScreen {...props} users={users} setCurrentUser={setCurrentUser} />}
//         </Stack.Screen>
//         <Stack.Screen name="SignUp">
//           {props => <SignUpScreen {...props} setUsers={setUsers} />}
//         </Stack.Screen>
//         <Stack.Screen name="Home">
//           {props => <HomeScreen {...props} currentUser={currentUser} />}
//         </Stack.Screen>
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// };

// // Styles for the components
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     marginBottom: 20,
//   },
//   input: {
//     height: 40,
//     borderColor: 'gray',
//     borderWidth: 1,
//     marginBottom: 10,
//     width: '100%',
//     paddingLeft: 10,
//   },
//   link: {
//     color: 'blue',
//     marginTop: 10,
//   },
//   info: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
// });

// export default App;
