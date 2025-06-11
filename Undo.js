import React from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import colors from './theme/colors';
import Allcontrols from './Allcontrols';

const imageList = [
  require('./asset/1.jpeg'),
  require('./asset/2.jpeg'),
  require('./asset/3.jpeg'),
];

const Undo = ({ route }) => {
  const { data } = route.params || {};

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.allControlsContainer}>
        <Allcontrols text="Undo Changes" />
      </View>

      {/* Centered Undo All button */}
      <View style={styles.buttonWrapper}>
        <Button
          mode='contained'
          style={styles.button}
          labelStyle={styles.buttonText}
          onPress={() => { }}>
          Undo All
        </Button>
      </View>

      {/* Vertical scrolling cards */}
      <ScrollView contentContainerStyle={styles.cardContainer}>
        {imageList.map((imgSrc, index) => (
          <View key={index} style={styles.card}>
            <Image source={imgSrc} style={styles.image} />
            <View style={styles.cardButtons}>
              <Button
                mode="outlined"
                style={styles.actionButton}
                labelStyle={styles.actionButtonText}
                onPress={() => console.log('View clicked')}>
                View
              </Button>
              <Button
                mode="outlined"
                style={styles.actionButton}
                labelStyle={styles.actionButtonText}
                onPress={() => console.log('Undo clicked')}>
                Undo
              </Button>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  allControlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  buttonWrapper: {
    marginTop: 100,
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.primary,
    borderColor: colors.dark,
    borderWidth: 1,
    width: 160,
  },
  buttonText: {
    color: colors.dark,
  },
  cardContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderColor: colors.dark,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 16,
  },
  cardButtons: {
    flexDirection: 'column',
    gap: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  actionButtonText: {
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Undo;
