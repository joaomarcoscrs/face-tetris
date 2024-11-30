import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { TetrisBlock as TetrisBlockType } from "../types/tetris";
import { BLOCK_SIZE, COLORS } from "../constants/tetris";

interface Props {
  block: TetrisBlockType;
}

export default function TetrisBlock({ block }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

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
      // Reset animations when not clearing
      scaleAnim.setValue(1);
      opacityAnim.setValue(1);
    }
  }, [block.isClearing]);

  return (
    <Animated.View
      style={[
        styles.block,
        {
          backgroundColor: COLORS[block.color],
          left: block.x * BLOCK_SIZE,
          top: block.y * BLOCK_SIZE,
          transform: [{ scale: scaleAnim }],
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
  },
});
