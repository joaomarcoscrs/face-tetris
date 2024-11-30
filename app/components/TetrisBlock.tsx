import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { TetrisBlock as TetrisBlockType } from "../types/tetris";
import { BLOCK_SIZE, COLORS } from "../constants/tetris";

interface Props {
  block: TetrisBlockType;
  isClearing?: boolean;
}

export default function TetrisBlock({ block, isClearing }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isClearing) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.7,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [isClearing]);

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
