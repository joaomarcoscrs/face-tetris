import React, { useReducer, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { GameState, GameAction } from "../types/tetris";
import {
  createEmptyBoard,
  createRandomPiece,
  isValidMove,
  rotatePiece,
  mergePieceToBoard,
  clearLines,
} from "../utils/tetrisLogic";
import TetrisBoard from "./TetrisBoard";

const initialState: GameState = {
  currentPiece: null,
  board: createEmptyBoard(),
  score: 0,
  isGameOver: false,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "MOVE_LEFT":
      if (
        state.currentPiece &&
        isValidMove(state.currentPiece, state.board, -1)
      ) {
        return {
          ...state,
          currentPiece: {
            ...state.currentPiece,
            x: state.currentPiece.x - 1,
          },
        };
      }
      return state;

    case "MOVE_RIGHT":
      if (
        state.currentPiece &&
        isValidMove(state.currentPiece, state.board, 1)
      ) {
        return {
          ...state,
          currentPiece: {
            ...state.currentPiece,
            x: state.currentPiece.x + 1,
          },
        };
      }
      return state;

    case "ROTATE":
      if (state.currentPiece) {
        const rotatedPiece = rotatePiece(state.currentPiece);
        if (isValidMove(rotatedPiece, state.board)) {
          return {
            ...state,
            currentPiece: rotatedPiece,
          };
        }
      }
      return state;

    case "MOVE_DOWN":
      if (
        state.currentPiece &&
        isValidMove(state.currentPiece, state.board, 0, 1)
      ) {
        return {
          ...state,
          currentPiece: {
            ...state.currentPiece,
            y: state.currentPiece.y + 1,
          },
        };
      }
      // If can't move down, merge piece to board
      if (state.currentPiece) {
        const newBoard = mergePieceToBoard(state.currentPiece, state.board);
        const clearedBoard = clearLines(newBoard);
        return {
          ...state,
          currentPiece: null,
          board: clearedBoard,
        };
      }
      return state;

    case "NEW_PIECE":
      return {
        ...state,
        currentPiece: action.piece,
      };

    case "GAME_OVER":
      return {
        ...state,
        isGameOver: true,
      };

    default:
      return state;
  }
}

export default function TetrisGame() {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    if (!gameState.currentPiece && !gameState.isGameOver) {
      const newPiece = createRandomPiece();
      if (isValidMove(newPiece, gameState.board)) {
        dispatch({ type: "NEW_PIECE", piece: newPiece });
      } else {
        dispatch({ type: "GAME_OVER" });
      }
    }
  }, [gameState.currentPiece, gameState.isGameOver]);

  // Expose control methods
  const moveLeft = () => dispatch({ type: "MOVE_LEFT" });
  const moveRight = () => dispatch({ type: "MOVE_RIGHT" });
  const rotate = () => dispatch({ type: "ROTATE" });
  const moveDown = () => dispatch({ type: "MOVE_DOWN" });

  return (
    <View style={styles.container}>
      <TetrisBoard gameState={gameState} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
