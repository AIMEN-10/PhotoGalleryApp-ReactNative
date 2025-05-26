import React, { useState, useRef } from 'react';
import {
  Modal,
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  TouchableOpacity,
  PanResponder,
} from 'react-native';


const EmbeddingModal = ({ visible, onClose, embeddingData ,selectedPerson}) => {
  const [selectedGroupKeys, setSelectedGroupKeys] = useState([]);
// console.log('emb data',embeddingData,selectedPerson);
  if (!embeddingData || Object.keys(embeddingData).length === 0) return null;

  const handleGroupToggle = (key) => {
    setSelectedGroupKeys((prevSelected) =>
      prevSelected.includes(key)
        ? prevSelected.filter((k) => k !== key) // Deselect
        : [...prevSelected, key]               // Select
    );
  };

  

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Same or different person?</Text>
            <Image
              source={{ uri: `${baseUrl}${selectedPerson.personPath}` }}
              style={styles.avatar}
            />
          </View>

          <Text style={styles.subtitle}>Tap on group(s)</Text>

          {/* Scrollable Groups */}
          <ScrollView contentContainerStyle={styles.scrollArea}>
            {Object.entries(embeddingData).map(([key, values]) => (
  <View
    key={key}
    style={[
      styles.groupCard,
      selectedGroupKeys.includes(key) && styles.groupCardSelected,
    ]}
  >
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
    >
      {values.map((v, i) => (
        <Pressable
          key={i}
          onPress={() => handleGroupToggle(key)}
          android_ripple={{ color: '#FFB20033' }}
          style={{ marginRight: 10 }}
        >
          <Image
            source={{ uri: `${baseUrl}face_images/${v}` }}
            style={styles.circleImage}
          />
        </Pressable>
      ))}
    </ScrollView>
  </View>
))}

          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.differentButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonTextDark}>Different</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.sameButton]}>
              <Text style={styles.buttonTextLight}>Same</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFE9B3',
    padding: 20,
    borderRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginVertical: 10,
  },
  scrollArea: {
    paddingBottom: 20,
  },
  groupCard: {
    backgroundColor: '#FFF7D6',
    borderRadius: 16,
    padding: 10,
    marginBottom: 15,
  },
  groupCardSelected: {
    backgroundColor: '#FFD770',
    borderWidth: 2,
    borderColor: '#FFB200',
  },
  circleImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  sameButton: {
    backgroundColor: '#FFB200',
  },
  differentButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFB200',
  },
  buttonTextLight: {
    color: '#FFF',
    fontWeight: '600',
  },
  buttonTextDark: {
    color: '#333',
    fontWeight: '600',
  },
});

export default EmbeddingModal;
