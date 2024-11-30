import React, { useEffect, useRef } from "react";
import { StyleSheet, Animated } from "react-native";
import { TetrisBlock as TetrisBlockType } from "../types/tetris";
import { BLOCK_SIZE, COLORS } from "../constants/tetris";

interface Props {
  block: TetrisBlockType;
}

export default function TetrisBlock({ block }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const positionX = useRef(new Animated.Value(block.x * BLOCK_SIZE)).current;
  const positionY = useRef(new Animated.Value(block.y * BLOCK_SIZE)).current;

  // Handle clearing animation
  useEffect(() => {
    if (block.isClearing) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(1);
      opacityAnim.setValue(1);
    }
  }, [block.isClearing]);

  // Handle position animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(positionX, {
        toValue: block.x * BLOCK_SIZE,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(positionY, {
        toValue: block.y * BLOCK_SIZE,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [block.x, block.y]);

  return (
    <Animated.View
      style={[
        styles.block,
        {
          backgroundColor: COLORS[block.color],
          transform: [
            { scale: scaleAnim },
            { translateX: positionX },
            { translateY: positionY },
          ],
          opacity: opacityAnim,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  block: {
    position: "absolute",
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    left: 0,
    top: 0,
  },
});
