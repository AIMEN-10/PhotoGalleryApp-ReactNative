import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  findNodeHandle,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import {
  PanGestureHandler,
  TouchableWithoutFeedback
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

import colors from './theme/colors';
import FoldersData from './ViewModels/FoldersData';
import {
  getAllPersonLinks,
  insertPersonLinkIfNotExists,
  getAllPersons,
  handleUpdateEmbeddings,
} from './Databasequeries';

const windowWidth = Dimensions.get('window').width;

const DraggableFolder = ({ item, dataIsPerson, onDrop, registerLayout, onPress }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const viewRef = useRef(null);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
      runOnJS(setIsDragging)(true);
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: (event) => {
      runOnJS(setIsDragging)(false);
      runOnJS(onDrop)(item.id, event.absoluteX, event.absoluteY);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    zIndex: isDragging ? 9999 : 0,
    elevation: isDragging ? 20 : 0,
    borderColor: isDragging ? 'orange' : colors.primary,
  }));

  const handleLayout = () => {
    viewRef.current?.measure?.((x, y, width, height, pageX, pageY) => {
      registerLayout(item.id, { pageX, pageY, width, height });
    });
  };

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
        style={[styles.folderborder]}
        onLayout={handleLayout}
        ref={viewRef}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View
        ref={viewRef}
        onLayout={handleLayout}
        style={[styles.folderborder, animatedStyle]}
      >
        <TouchableWithoutFeedback
          onPress={() => onPress(item.id, item.name)}
        >
          {content}
        </TouchableWithoutFeedback>
      </Animated.View>
    </PanGestureHandler>
  );
};

const Folders = ({ route }) => {
  const { data } = route.params || {};
  const [result, setResult] = useState([]);
  const [layouts, setLayouts] = useState({});
  const navigation = useNavigation();

  const loadData = async () => {
    const folders = await FoldersData({ data });
    // setResult(folders || []);
     const sortedFolders = (folders || []).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  setResult(sortedFolders);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [data])
  );

  const registerLayout = (id, layout) => {
    setLayouts((prev) => ({
      ...prev,
      [id]: layout,
    }));
  };

  const dataIsPerson = data === 'Person';

  const handleDrop = (draggedId, dropX, dropY) => {
    for (const id in layouts) {
      const numericId = Number(id);
      if (numericId === Number(draggedId)) continue;
      const { pageX, pageY, width, height } = layouts[id];
      if (
        dropX >= pageX &&
        dropX <= pageX + width &&
        dropY >= pageY &&
        dropY <= pageY + height
      ) {
        Alert.alert(
          'Do you want to merge?',
                     `Dragged ID: ${draggedId}\nDropped On ID: ${id}`,

          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'OK',
              onPress: async () => {
                try {
                  await insertPersonLinkIfNotExists(draggedId, numericId);

                  const persons = await getAllPersons();
                  const links = await getAllPersonLinks();
                  const draggedPerson = result.find((p) => p.id === draggedId);
                  const person1 = (draggedPerson?.imagePath ?? '').split('/').pop();
                  const name = draggedPerson?.name ?? '';

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
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(payload),
                    });

                    const resultRes = await response.json();
                    await handleUpdateEmbeddings(name, resultRes);
                    await loadData();
                  } catch (error) {
                    console.error('Error fetching embedding group:', error);
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
    borderColor: colors.primary,
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
