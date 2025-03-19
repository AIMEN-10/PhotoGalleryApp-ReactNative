import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { TextInput, Button, Checkbox, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login2 = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const checkRememberedUser = async () => {
      const savedUser = await AsyncStorage.getItem('rememberedUser');
      if (savedUser) {
        const { username, password } = JSON.parse(savedUser);
        setUsername(username);
        setPassword(password);
        setRememberMe(true);
      }
    };
    checkRememberedUser();
  }, []);

  const handleLogin = async () => {
    try {
      const storedData = await AsyncStorage.getItem('user');
      if (!storedData) {
        Alert.alert('Error', 'No user found, please sign up');
        return;
      }

      const { username: storedUsername, password: storedPassword } = JSON.parse(storedData);

      if (username === storedUsername && password === storedPassword) {
        if (rememberMe) {
          await AsyncStorage.setItem('rememberedUser', JSON.stringify({ username, password }));
        } else {
          await AsyncStorage.removeItem('rememberedUser');
        }
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.input} 
        placeholder="Enter username" 
        placeholderTextColor="#aaa" 
        value={username} 
        onChangeText={setUsername} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Enter password" 
        placeholderTextColor="#aaa" 
        secureTextEntry 
        value={password} 
        onChangeText={setPassword} 
      />
      <Button onPress={handleLogin}>Login</Button>
      <View style={styles.checkboxContainer}>
        <Checkbox status={rememberMe ? 'checked' : 'unchecked'} onPress={() => setRememberMe(!rememberMe)} />
        <Text>Remember Me</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { marginBottom: 15, backgroundColor: '#0D6068', color: '#fff' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center' },
});

export default Login2;
