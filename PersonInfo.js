import React ,{useState} from 'react';
import { View, Text, StyleSheet ,TextInput} from 'react-native';
import { RadioButton } from 'react-native-paper';
import colors from './theme/colors';


const PersonInfo = () => {
    const [gender, setGender] = useState('Male');

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Name Person</Text>
            <View style={styles.card}>
                <View style={styles.imageContainer}>
                    <Text>Image</Text>
                </View>
                <View style={styles.formContainer}>
                    <Text style={styles.label}>Enter Name:</Text>
                    <TextInput style={styles.input} placeholder="Name" />
                    <View style={styles.radioGroup}>
                        <View style={styles.radioButton}>
                            <RadioButton
                                value="male"
                                status={gender === 'male' ? 'checked' : 'unchecked'}
                                onPress={() => setGender('male')}
                                color={colors.dark} 
                                uncheckedColor={colors.dark}
                                
                            />
                            <Text style={styles.label}>Male</Text>
                        </View>
                        <View style={styles.radioButton}>
                            <RadioButton
                                value="female"
                                status={gender === 'female' ? 'checked' : 'unchecked'}
                                onPress={() => setGender('female')}
                                color={colors.dark} // Set the color of the RadioButton
                                uncheckedColor={colors.dark}
                            />
                            <Text style={styles.label}>Female</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: colors.secondary,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: colors.dark,
    },
    card: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: colors.primary,
        borderRadius: 8,
    },
    imageContainer: {
        width: 100,
        height: 100,
        backgroundColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        marginRight: 10,
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color:colors.dark,
    },
    input: {
        borderWidth: 1,
        borderColor:colors.dark,
        borderRadius: 5,
        padding: 8,
        marginBottom: 10,
        backgroundColor: colors.secondary,
        color: colors.dark,
    },
    radioGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
        color: colors.dark,
    },
});


export default PersonInfo;