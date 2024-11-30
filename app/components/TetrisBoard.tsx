import React from "react";
import { View, StyleSheet } from "react-native";
import { BOARD_WIDTH, BOARD_HEIGHT, BLOCK_SIZE } from "../constants/tetris";
import { GameState } from "../types/tetris";
import TetrisBlock from "./TetrisBlock";
import DashLine from "./DashLine";
import GhostPiece from "./GhostPiece";
import { CustomDarkTheme } from "../../constants/theme";

export const GAME_OVER_LINE = 3;

interface Props {
  gameState: GameState;
}

export default function TetrisBoard({ gameState }: Props) {
  const { board, currentPiece } = gameState;

  return (
    <View style={styles.boardContainer}>
      <View style={styles.boardBorder}>
        <View style={styles.board}>
          {board.map((row, y) =>
            row.map(
              (block, x) =>
                block && <TetrisBlock key={`${x}-${y}`} block={block} />
            )
          )}
          {currentPiece && (
            <GhostPiece currentPiece={currentPiece} board={board} />
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
          <View
            style={[
              styles.dashLineContainer,
              { top: GAME_OVER_LINE * BLOCK_SIZE },
            ]}
          >
            <DashLine />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boardContainer: {
    padding: 3,
    backgroundColor: CustomDarkTheme.colors.background,
    borderRadius: 16,
  },
  boardBorder: {
    padding: 3,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  board: {
    width: BOARD_WIDTH * BLOCK_SIZE,
    height: BOARD_HEIGHT * BLOCK_SIZE,
    backgroundColor: CustomDarkTheme.colors.background,
    borderRadius: 8,
    overflow: "hidden",
  },
  dashLineContainer: {
    position: "absolute",
    left: 0,
    right: 0,
  },
});
