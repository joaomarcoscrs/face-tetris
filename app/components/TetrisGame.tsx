import React, { useReducer, useEffect, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
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
import { Ionicons } from "@expo/vector-icons";
import { CustomDarkTheme } from "../../constants/theme";
import { interval, Subject, fromEvent } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { GAME_OVER_LINE } from "./TetrisBoard";
import GameOverOverlay from "./GameOverOverlay";

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
          score: state.score + (clearedBoard !== newBoard ? 100 : 0),
        };
      }
      return state;

    case "HARD_DROP":
      if (state.currentPiece) {
        let newY = state.currentPiece.y;
        while (
          isValidMove({ ...state.currentPiece, y: newY + 1 }, state.board)
        ) {
          newY++;
        }
        const droppedPiece = { ...state.currentPiece, y: newY };
        const newBoard = mergePieceToBoard(droppedPiece, state.board);
        const clearedBoard = clearLines(newBoard);
        return {
          ...state,
          currentPiece: null,
          board: clearedBoard,
          score: state.score + (clearedBoard !== newBoard ? 100 : 0),
        };
      }
      return state;

    case "NEW_PIECE":
      if (
        action.piece.blocks.some((block) => {
          const absoluteY = action.piece.y + block.y;
          return absoluteY <= GAME_OVER_LINE;
        })
      ) {
        return {
          ...state,
          isGameOver: true,
        };
      }
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
  const gameOver$ = new Subject<void>();

  // Game loop using RxJS
  useEffect(() => {
    if (gameState.isGameOver) {
      gameOver$.next();
      return;
    }

    const gameLoop$ = interval(1000).pipe(
      takeUntil(gameOver$),
      filter(() => !gameState.isGameOver)
    );

    const subscription = gameLoop$.subscribe(() => {
      dispatch({ type: "MOVE_DOWN" });
    });

    return () => {
      subscription.unsubscribe();
      gameOver$.complete();
    };
  }, [gameState.isGameOver]);

  // Spawn new pieces
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

  const moveLeft = useCallback(() => dispatch({ type: "MOVE_LEFT" }), []);
  const moveRight = useCallback(() => dispatch({ type: "MOVE_RIGHT" }), []);
  const rotate = useCallback(() => dispatch({ type: "ROTATE" }), []);
  const hardDrop = useCallback(() => dispatch({ type: "HARD_DROP" }), []);

  return (
    <View style={styles.container}>
      <TetrisBoard gameState={gameState} />

      <View style={styles.controls}>
        <TouchableOpacity onPress={moveLeft} style={styles.controlButton}>
          <Ionicons
            name="arrow-back"
            size={30}
            color={CustomDarkTheme.colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={rotate} style={styles.controlButton}>
          <Ionicons
            name="refresh"
            size={30}
            color={CustomDarkTheme.colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={moveRight} style={styles.controlButton}>
          <Ionicons
            name="arrow-forward"
            size={30}
            color={CustomDarkTheme.colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={hardDrop} style={styles.controlButton}>
          <Ionicons
            name="arrow-down"
            size={30}
            color={CustomDarkTheme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      {gameState.isGameOver && <GameOverOverlay />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    gap: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
});
