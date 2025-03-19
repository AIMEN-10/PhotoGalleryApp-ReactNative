import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = ({ navigation }) => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const { username } = JSON.parse(storedUser);
          setUsername(username);
        }
      } catch (error) {
        console.error('Failed to load username', error);
      }
    };
    fetchUsername();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user'); // Remove stored user data
      await AsyncStorage.removeItem('rememberedUser'); // Remove remembered login data
      navigation.replace('LogIn'); // Redirect to login screen
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome, {username}!</Text>
      <Button title="Logout" onPress={handleLogout} color="#d9534f" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  welcomeText: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: 'black' },
});

export default Home;
