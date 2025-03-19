import React from 'react';
import {View,Text, Button, TextInput, StyleSheet} from 'react-native';

const Login=()=>{
  return (
    <View style={{backgroundColor:'black',marginTop:100}}>
<View >


<Text style={{textAlign:'center'}}>
 Login Form
</Text>
</View>
<View>
<TextInput title=" Enter user Name Here">
   
    </TextInput >
    <TextInput>
    Enter password Here
    </TextInput>
</View>
<View>
  <Text style={{textAlign:'center'}}>
    Invalid username Password
  </Text>
</View>
<View>
  <Button title="LOGIN">

  </Button>
</View>
    </View>
  );
}
const style=StyleSheet.create ({
TextInput:{
  border:2,
 
}
});
  

export default Login;