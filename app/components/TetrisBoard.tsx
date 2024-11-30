import React from "react";
import { View, StyleSheet } from "react-native";
import { BOARD_WIDTH, BOARD_HEIGHT, BLOCK_SIZE } from "../constants/tetris";
import { GameState } from "../types/tetris";
import TetrisBlock from "./TetrisBlock";

interface Props {
  gameState: GameState;
}

export default function TetrisBoard({ gameState }: Props) {
  const { board, currentPiece } = gameState;

  return (
    <View style={styles.board}>
      {board.map((row, y) =>
        row.map(
          (block, x) => block && <TetrisBlock key={`${x}-${y}`} block={block} />
        )
      )}
      {currentPiece?.blocks.map((block, index) => (
        <TetrisBlock
          key={`current-${index}`}
          block={{
            ...block,
            x: currentPiece.x + block.x,
            y: currentPiece.y + block.y,
            color: block.color,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    width: BOARD_WIDTH * BLOCK_SIZE,
    height: BOARD_HEIGHT * BLOCK_SIZE,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 8,
    overflow: "hidden",
  },
});
