import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

const Groupbylocation = () => {
  const [color, setcolor] = useState("#0D6068");

  const locations = [
    { name: 'Location 1', image: require("./asset/1.jpeg") },
    { name: 'Location 2', image: require("./asset/1.jpeg") },
    { name: 'Location 3', image: require("./asset/1.jpeg") },
    { name: 'Location 4', image: require("./asset/1.jpeg") },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {locations.length === 0 ? (
          <Text>No images found</Text> // Wrapped string in Text
        ) : (
          locations.map((location, index) => (
            <View key={index} style={[styles.folderborder, { borderColor: color }]}>
              <Image source={location.image} style={styles.image} />
              <Text style={styles.imageName}>{location.name}</Text> {/* Wrapped location name in Text */}
            </View>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 80,
    borderRadius: 10,
  },
  folderborder: {
    width: "48%",
    marginBottom: 20,
    padding: 15,
    borderWidth: 3,
    borderRadius: 15,
    backgroundColor: "#fff",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageName: {
    color: "black",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    padding: 20,
  },
});

export default Groupbylocation;
