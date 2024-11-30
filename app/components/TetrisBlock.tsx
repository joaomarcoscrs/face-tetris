import React from "react";
import { View, StyleSheet } from "react-native";
import { TetrisBlock as TetrisBlockType } from "../types/tetris";
import { BLOCK_SIZE, COLORS } from "../constants/tetris";

interface Props {
  block: TetrisBlockType;
}

export default function TetrisBlock({ block }: Props) {
  return (
    <View
      style={[
        styles.block,
        {
          backgroundColor: COLORS[block.color],
          left: block.x * BLOCK_SIZE,
          top: block.y * BLOCK_SIZE,
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
