import React from "react";
import { View, StyleSheet } from "react-native";
import { TetrisPiece, TetrisBlock } from "../types/tetris";
import { BLOCK_SIZE } from "../constants/tetris";
import { isValidMove } from "../utils/tetrisLogic";
import { CustomDarkTheme } from "@/constants/theme";

interface Props {
  currentPiece: TetrisPiece;
  board: (TetrisBlock | null)[][];
}

export default function GhostPiece({ currentPiece, board }: Props) {
  // Calculate ghost piece position
  let ghostY = currentPiece.y;
  while (isValidMove({ ...currentPiece, y: ghostY + 1 }, board)) {
    ghostY++;
  }

  return (
    <>
      {currentPiece.blocks.map((block, index) => (
        <View
          key={`ghost-${index}`}
          style={[
            styles.ghostBlock,
            {
              left: (currentPiece.x + block.x) * BLOCK_SIZE,
              top: (ghostY + block.y) * BLOCK_SIZE,
            },
          ]}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  ghostBlock: {
    position: "absolute",
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
    backgroundColor: CustomDarkTheme.colors.card,
    borderWidth: 2,
    borderColor: CustomDarkTheme.colors.border,
    borderRadius: 4,
  },
});
