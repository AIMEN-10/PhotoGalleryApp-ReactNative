import React, { useState } from 'react';
import { View, ScrollView, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from './theme/colors';

const Folders = ({ route }) => {
    const { data } = route.params || {};
    const navigation = useNavigation();

    const handleNavigation = () => {
        navigation.navigate("Images", { data: labelname});
    };
const [labelname,setlabelname]=useState("Biit");
    return (
        <View style={styles.container}>
            <ScrollView >
                <View style={styles.grid}>

                    <TouchableOpacity
                        onPress={() => handleNavigation("Biit")}
                        activeOpacity={0.7}
                        style={[styles.folderborder, { borderColor: colors.primary }]}

                    >

                        <Image
                            source={require("./asset/4.jpeg")}
                            style={styles.image}
                        />

                        <Text style={styles.imageName}
                        >Biit</Text>
                    </TouchableOpacity>




                    
                     <TouchableOpacity
                        onPress={() => handleNavigation("path")}
                        activeOpacity={0.7}
                        style={[styles.folderborder, { borderColor: colors.primary }]}

                    >
                        <Image
                            source={require("./asset/8.jpeg")}
                            style={styles.image}
                        />

                        <Text style={styles.imageName}>Lake View</Text>

                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleNavigation("path")}
                        activeOpacity={0.7}
                        style={[styles.folderborder, { borderColor: colors.primary }]}

                    >

                        {/* <View style={[styles.folderborder, { borderColor: colors.primary }]}> */}
                        <Image
                            source={require("./asset/3.jpeg")}
                            style={styles.image}
                        />

                        <Text style={styles.imageName}>Park</Text>
                        {/* </View> */}
                    </TouchableOpacity>
                    {/* <TouchableOpacity
                        onPress={() => handleNavigation("path")}
                        activeOpacity={0.7}
                        style={[styles.folderborder, { borderColor: colors.primary }]}

                    >
                        <Image
                            source={require("./asset/12.jpeg")}
                            style={styles.image}
                        />

                        <Text style={styles.imageName}>2025-12-1</Text>

                    </TouchableOpacity> */}
                    {/*<TouchableOpacity
                        onPress={() => handleNavigation("path")}
                        activeOpacity={0.7}
                        style={[styles.folderborder, { borderColor: colors.primary }]}

                    >
                        <Image
                            source={require("./asset/1.jpeg")}
                            style={styles.image}
                        />

                        <Text style={styles.imageName}>{data} 5</Text>

                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleNavigation("path")}
                        activeOpacity={0.7}
                        style={[styles.folderborder, { borderColor: colors.primary }]}

                    >
                        <Image
                            source={require("./asset/1.jpeg")}
                            style={styles.image}
                        />

                        <Text style={styles.imageName}>{data} 6</Text>

                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleNavigation("path")}
                        activeOpacity={0.7}
                        style={[styles.folderborder, { borderColor: colors.primary }]}

                    >
                        <Image
                            source={require("./asset/1.jpeg")}
                            style={styles.image}
                        />

                        <Text style={styles.imageName}>{data} 7</Text>

                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleNavigation("path")}
                        activeOpacity={0.7}
                        style={[styles.folderborder, { borderColor: colors.primary }]}

                    >
                        <Image
                            source={require("./asset/1.jpeg")}
                            style={styles.image}
                        />

                        <Text style={styles.imageName}>{data} 8</Text>

                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleNavigation("path")}
                        activeOpacity={0.7}
                        style={[styles.folderborder, { borderColor: colors.primary }]}

                    >
                        <Image
                            source={require("./asset/1.jpeg")}
                            style={styles.image}
                        />

                        <Text style={styles.imageName}>{data} 9</Text>

                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleNavigation("path")}
                        activeOpacity={0.7}
                        style={[styles.folderborder, { borderColor: colors.primary }]}

                    >
                        <Image
                            source={require("./asset/1.jpeg")}
                            style={styles.image}
                        />

                        <Text style={styles.imageName}>{data} 10</Text>

                    </TouchableOpacity> */}
                </View>





                {/* <View style={styles.grid}>
                    {Array.from({ length: 10 }, (_, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={handleNavigation}
                            activeOpacity={0.7}
                            style={[styles.folderborder, { borderColor: colors.primary }]}
                        >
                            <Image
                                source={require("./asset/1.jpeg")}
                                style={styles.image}
                            />
                            <Text style={styles.imageName}>{data} {i + 1}</Text>
                        </TouchableOpacity>
                    ))}
                </View> */}
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