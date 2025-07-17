import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  useAnimatedScrollHandler
} from 'react-native-reanimated';

import colors from './theme/colors';
import FoldersData from './ViewModels/FoldersData';
import {
  getAllPersonLinks,
  insertPersonLinkIfNotExists,
  getAllPersons,
  handleUpdateEmbeddings,
  getpersonnames
} from './Databasequeries';
import { SelectList } from 'react-native-dropdown-select-list';

const windowWidth = Dimensions.get('window').width;

const DraggableFolder = ({ item, dataIsPerson, onDrop, registerLayout, onPress, maybeAutoScroll }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const viewRef = useRef(null);

  const lastX = useSharedValue(0);
  const lastY = useSharedValue(0);

  const handleLayout = () => {
    viewRef.current?.measure?.((x, y, width, height, pageX, pageY) => {
      registerLayout(item.id, { pageX, pageY, width, height });
    });
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (isDragging.value) {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
        lastX.value = event.absoluteX;
        lastY.value = event.absoluteY;

        runOnJS(maybeAutoScroll)(event.absoluteY);
      }
    })
    .onEnd(() => {
      if (isDragging.value) {
        runOnJS(onDrop)(item.id, lastX.value, lastY.value);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        isDragging.value = false;
      }
    });

  const longPressGesture = Gesture.LongPress()
    .minDuration(300)
    .onStart(() => {
      isDragging.value = true;
    });

  const composedGesture = Gesture.Simultaneous(longPressGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    zIndex: isDragging.value ? 999 : 0,
    elevation: isDragging.value ? 20 : 5,
    borderColor: isDragging.value ? 'orange' : colors.primary,
  }));

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
      <View
        onLayout={handleLayout}
        ref={viewRef}
        style={styles.folderborder}
      >
        <TouchableOpacity onPress={() => onPress(item.id, item.name)}>
          {content}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        ref={viewRef}
        onLayout={handleLayout}
        style={[styles.folderborder, animatedStyle]}
      >
        {/* {content} */}
         <TouchableOpacity
          onPress={() => onPress(item.id, item.name)}
        >
          {content}
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
};

const TaskFolders = ({ route }) => {
  const { data } = route.params || {};
  console.log("hee")
  const [result, setResult] = useState([]);
  const [layouts, setLayouts] = useState({});
  const navigation = useNavigation();

  const scrollRef = useRef(null);
  const scrollY = useSharedValue(0);
    const [selectedCategory, setSelectedCategory] = useState(null);

// const [arr,setarr]=useState([]);
const [arr, setArr] = useState([
        // { key: 1, value: "abc" },
        // { key: 2, value: "Ali" },
        // { key: 3, value: "Alia" },
        //  { key: 4, value: "Student" },
        //   { key: 5, value: "xyz" },
    ]);
  const loadData = async () => {
    const folders = await FoldersData({ data });
    console.log("folderrs",folders);
    const mydata=folders?.map(p=>p.name);
    console.log(mydata);
    setArr(mydata)
//     const mymethod=async()=>{
//         const n=await getpersonnames();
//         setarr(n.name);
//     }
//    mymethod()

   
    const sortedFolders = (folders || []).sort((a, b) =>
        
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      
    );
    
    setResult(sortedFolders);
    
  };
mymethod=(value)=>{
    console.log("value",value)
setSelectedCategory(value);
navigation.navigate('Newscreen', { data:value});
}
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

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const SCROLL_THRESHOLD = 80;
  const SCROLL_AMOUNT = 30;

  const maybeAutoScroll = (y) => {
    if (!scrollRef.current) return;

    scrollRef.current.measure((fx, fy, width, height, px, py) => {
      const topEdge = py + SCROLL_THRESHOLD;
      const bottomEdge = py + height - SCROLL_THRESHOLD;

      if (y < topEdge) {
        scrollRef.current.scrollTo({
          y: Math.max(scrollY.value - SCROLL_AMOUNT, 0),
          animated: false,
        });
      } else if (y > bottomEdge) {
        scrollRef.current.scrollTo({
          y: scrollY.value + SCROLL_AMOUNT,
          animated: false,
        });
      }
    });
  };

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
            { text: 'Cancel', style: 'cancel' },
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

                  const response = await fetch(data_url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                  });

                  const resultRes = await response.json();
                  await handleUpdateEmbeddings(name, resultRes);
                  await loadData();
                } catch (error) {
                  console.error('Error during merge:', error);
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
        <SelectList
                data={arr}
                placeholder="Select person"
                setSelected={(value)=>{mymethod(value)}}
                search={false}
                dropdownStyles={{
            backgroundColor: 'black', 
            borderRadius: 5, 
            paddingVertical: 10, 
          }}
                boxStyles={{ backgroundColor: 'black' ,color:'black'}}
                style={{color:'black',backgroundColor:'black'}}
                save="value"
            />
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <View style={styles.grid}>

          {result.map((item, index) => (
            

            <DraggableFolder
              key={`${item.id ?? 'missing'}-${index}`}
              item={item}
              dataIsPerson={dataIsPerson}
              onDrop={handleDrop}
              registerLayout={registerLayout}
              onPress={handleNavigation}
              maybeAutoScroll={maybeAutoScroll}
            />
          ))}
        </View>
      </Animated.ScrollView>
        
    </View>
    
  )
  


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

export default TaskFolders;
