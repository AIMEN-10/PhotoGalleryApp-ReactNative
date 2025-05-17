import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Animated,
  PanResponder,
  UIManager,
  findNodeHandle,
} from 'react-native';

const Drag = () => {
  const pan = useRef(new Animated.ValueXY()).current;
  const dropZone1Ref = useRef(null);
  const dropZone2Ref = useRef(null);
  const [dropZones, setDropZones] = useState([]);
  const [hasCollidedWith, setHasCollidedWith] = useState(null);

  const draggedSize = { width: 100, height: 100 };

  useEffect(() => {
    const measure = (ref) =>
      new Promise((resolve) => {
        const node = findNodeHandle(ref.current);
        if (node) {
          UIManager.measure(node, (x, y, width, height, pageX, pageY) => {
            resolve({ x: pageX, y: pageY, width, height });
          });
        }
      });

    const measureAllZones = async () => {
      const zone1 = await measure(dropZone1Ref);
      const zone2 = await measure(dropZone2Ref);
      setDropZones([
        { ...zone1, id: 'drop-1' },
        { ...zone2, id: 'drop-2' },
      ]);
    };

    setTimeout(measureAllZones, 500); // ensure layout is complete
  }, []);

  const checkCollision = (gestureState) => {
    const draggedX = gestureState.moveX - draggedSize.width / 2;
    const draggedY = gestureState.moveY - draggedSize.height / 2;

    for (let zone of dropZones) {
      const isOverlap =
        draggedX < zone.x + zone.width &&
        draggedX + draggedSize.width > zone.x &&
        draggedY < zone.y + zone.height &&
        draggedY + draggedSize.height > zone.y;

      if (isOverlap && hasCollidedWith !== zone.id) {
        setHasCollidedWith(zone.id);
        Alert.alert('Collision Detected', `Dragged into ${zone.id}`);
        return;
      }
    }

    // reset collision if no longer overlapping
    const stillOverlapping = dropZones.some((zone) => {
      const isOverlap =
        draggedX < zone.x + zone.width &&
        draggedX + draggedSize.width > zone.x &&
        draggedY < zone.y + zone.height &&
        draggedY + draggedSize.height > zone.y;
      return isOverlap;
    });

    if (!stillOverlapping) {
      setHasCollidedWith(null);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (evt, gestureState) => {
        Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        })(evt, gestureState);

        checkCollision(gestureState);
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.draggable, { transform: pan.getTranslateTransform() }]}
        {...panResponder.panHandlers}
      >
        <Text style={styles.dragText}>Drag Me</Text>
      </Animated.View>

      <View ref={dropZone1Ref} style={styles.dropZone}>
        <Text>Drop Here 1</Text>
      </View>

      <View ref={dropZone2Ref} style={styles.dropZone}>
        <Text>Drop Here 2</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
    alignItems: 'center',
  },
  draggable: {
    width: 100,
    height: 100,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  dragText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dropZone: {
    marginTop: 200,
    width: 200,
    height: 90,
    backgroundColor: '#dfe6e9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
});

export default Drag;
