import React,{useState} from 'react';
import {StyleSheet, Text,View} from 'react-native';
import { Checkbox,Button } from 'react-native-paper';

const Checkbox_example=()=>{

const[op,setop]=useState(0)
const[op2,setop2]=useState(0)
const[op3,setop3]=useState(0)
const[op4,setop4]=useState(0)
const[an,setan]=useState(0)
const[an2,setan2]=useState(0)
const[an3,setan3]=useState(0)
const[an4,setan4]=useState(0)
const abc=()=>{
if(op==1){
setan(1)
}
if(op2==1){
    setan2(2)
    }
if(op3==1){
        setan3(3)
        }
 if(op4==1){
            setan4(4)
            }
}
    return(
        <View style={styles.container}>
            <Text >
Checkbox example            </Text>
<View style={{flexDirection:'row'}}>
<Checkbox status={op==1?'checked':'unchecked'} onPress={() => setop(op == 1 ? 0 : 1)}></Checkbox>
<Text>1</Text>

</View>
<View style={{flexDirection:'row'}}>
<Checkbox status={op2==1?'checked':'unchecked'} onPress={() => setop2(op2 == 1 ? 0 : 1)}></Checkbox>
<Text>2</Text>

</View>
<View style={{flexDirection:'row'}}>
<Checkbox status={op3==1?'checked':'unchecked'}onPress={() => setop3(op3 == 1 ? 0 : 1)}></Checkbox>
<Text>3</Text>

</View>
<View style={{flexDirection:'row'}}>
<Checkbox status={op4==1?'checked':'unchecked'}onPress={() => setop4(op4 == 1 ? 0 : 1)}></Checkbox>
<Text>4</Text>

</View>
<Button mode='contained'onPress={abc}>show</Button>
<Text>
   {an}
    
</Text>
<Text>
   {an2}
    
</Text>
<Text>
   {an3}
    
</Text>
<Text>
   {an4}
    
</Text>
        </View>
    )

}
const styles=StyleSheet.create({
container:{


}





})
export default Checkbox_example;