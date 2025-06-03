import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from './theme/colors';
import FoldersData from './ViewModels/FoldersData';
import { getAllPersonLinks, insertPersonLinkIfNotExists, getAllPersons, handleUpdateEmbeddings } from './Databasequeries';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';


const windowWidth = Dimensions.get('window').width;

const DraggableFolder = ({ item, dataIsPerson, onDrop, registerLayout, onPress }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const [isDragging, setIsDragging] = useState(false);
  const dragStartTime = useRef(0);

  const panResponder = dataIsPerson
    ? PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
        dragStartTime.current = Date.now();
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gesture) => {
        setIsDragging(false);
        pan.flattenOffset();
        const timeHeld = Date.now() - dragStartTime.current;

        // If it's a quick tap, treat as a press
        if (Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5 && timeHeld < 200) {
          onPress(item.id, item.name);
        } else {
          onDrop(item.id, gesture.moveX, gesture.moveY);
        }

        pan.setValue({ x: 0, y: 0 });
      },
    })
    : null;

  const folderStyles = [
    styles.folderborder,
    { borderColor: isDragging ? 'orange' : colors.primary, backgroundColor: isDragging ? '#fff' : '#fff' },
    isDragging && { zIndex: 9999, elevation: 20 },
  ];

  const content = (
    <>
      <Image
        source={{
          uri:
            item.imagePath.startsWith('file://') ||
              item.imagePath.startsWith('content://') ||
              item.imagePath.startsWith('http')
              ? item.imagePath
              : baseUrl + item.imagePath,
        }}
        style={styles.image}
      />
      <Text style={styles.imageName}>{item.name}</Text>
    </>
  );

  if (!dataIsPerson) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onPress(item.id, item.name)}
        style={[...folderStyles]}
        onLayout={(e) => registerLayout(item.id, e)}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[pan.getLayout(), ...folderStyles]}
      onLayout={(e) => registerLayout(item.id, e)}
    >
      {content}
    </Animated.View>
  );
};

const Folders = ({ route }) => {
  const { data } = route.params || {};
  const [result, setResult] = useState([]);
  const [layouts, setLayouts] = useState({}); // store layout info
  const navigation = useNavigation();

  // useEffect(() => {
  //   const loadData = async () => {
  //     const folders = await FoldersData({ data });
  //     setResult(folders || []);
  //   };
  //   loadData();
  // }, [data]);
  const loadData = async () => {
    const folders = await FoldersData({ data });
    setResult(folders || []);
  };
  useFocusEffect(
    useCallback(() => {


      loadData();
    }, [data])
  );


  const registerLayout = (id, event) => {
    event.target.measure((fx, fy, width, height, px, py) => {
      setLayouts((prev) => ({
        ...prev,
        [id]: { pageX: px, pageY: py, width, height },
      }));
    });
  };

  const dataIsPerson = data === 'Person';

  const handleDrop = (draggedId, dropX, dropY) => {
    for (const id in layouts) {
      const numericId = Number(id);  // Convert string key to number
      if (numericId === Number(draggedId)) continue;
      const { pageX, pageY, width, height } = layouts[id];
      if (
        dropX >= pageX &&
        dropX <= pageX + width &&
        dropY >= pageY &&
        dropY <= pageY + height
      ) {
        // const fetchLocations = async () => {
        //   try {
        //     const data = await getAllPersonLinks();
        //     console.log(data);
        //   } catch (error) {
        //     console.error('Failed to load locations:', error);
        //   }
        // };

        // fetchLocations();
        Alert.alert(
          'Do you want to merge?',
          // `Dragged ID: ${draggedId}\nDropped On ID: ${id}`,
          '',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'OK',
              onPress: async () => {
                try {
                  const data = await insertPersonLinkIfNotExists(draggedId, numericId);

                  const persons = await getAllPersons();
                  const links = await getAllPersonLinks();
                  const draggedPerson = result.find(p => p.id === draggedId);
                  const person1 = (draggedPerson?.imagePath ?? '').split('/').pop();
                  const name = draggedPerson?.name ?? '';

                  console.log('pathh', person1);
                  const data_url = `${baseUrl}load_embeddings_for_recognition`;
                  const payload = {
                    persons,
                    links,
                    person1,
                  };

                  try {
                    const response = await fetch(data_url, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(payload)
                    });

                    const result = await response.json();
                    console.log('Embedding group after recognition:', result);
                    await handleUpdateEmbeddings(name, result);
                    //refresh page here 
                    await loadData();
                    // return result.group || result;  // adapt depending on response structure
                  } catch (error) {
                    console.error('Error fetching embedding group for recognition:', error);
                    return [];
                  }
                } catch (error) {
                  console.error('Failed to link person:', error);
                }
              },
            },
          ],
          { cancelable: true }
        );

        return;
      }
    }
  };

  const handleNavigation = (id, name) => {
    navigation.navigate('Images', { data: data + ';' + id + ';' + name });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.grid}>
          {result.map((item, index) => (
            <DraggableFolder
              // key={item.id}
              key={`${item.id ?? 'missing'}-${index}`}
              item={item}
              dataIsPerson={dataIsPerson}
              onDrop={handleDrop}
              registerLayout={registerLayout}
              onPress={handleNavigation}
            />
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    minWidth: '100%',
    padding: 20,
  },
  folderborder: {
    width: '48%',
    marginBottom: 20,
    padding: 15,
    borderWidth: 3,
    borderRadius: 15,
    backgroundColor: '#fff',
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
    resizeMode: 'cover',
    borderRadius: 10,
  },
  imageName: {
    color: 'black',
    textAlign: 'center',
  },
});

export default Folders;
