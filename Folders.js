import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from './theme/colors';
import FoldersData from './ViewModels/FoldersData';

const Folders = ({ route }) => {
    const { data } = route.params || {};
    const [result, setResult] = useState([]);
    
    const navigation = useNavigation();

    const loadData = async () => {
        setResult(await FoldersData({ data }));
    };

    useEffect(() => {
        loadData();
    }, []);



    const handleNavigation = (id,name) => {
        //console.log(result);
        navigation.navigate("Images", { data: data+';'+id+';'+name });
    };
   
    return (
        <View style={styles.container}>

            <ScrollView >
                <View style={styles.grid}>

                    {result.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleNavigation(item.id,item.name)}
                            activeOpacity={0.7}
                            style={[styles.folderborder, { borderColor: colors.primary }]}
                        >
                            <Image
                                source={{ uri: baseUrl + item.imagePath }}   // <<< this loads your imagePath
                                style={styles.image}
                            />
                            <Text style={styles.imageName}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    ))}

                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
    },
    grid: {
        paddingTop: 50,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        width: "100%",
        padding: 20,
    },
    folderborder: {
        width: "48%",
        marginBottom: 20,
        padding: 15,
        borderWidth: 3,
        borderRadius: 15,
        backgroundColor: "#fff",
        elevation: 15,
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1999,
    },
    image: {
        width: 100,
        height: 80,
        resizeMode: "cover",
        borderRadius: 10,
    },
    imageName: {
        color: "black",
        textAlign: 'center',
    },
});

export default Folders;