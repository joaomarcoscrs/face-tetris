import React, { useReducer, useEffect, useCallback, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { GameState, GameAction } from "../types/tetris";
import {
  createEmptyBoard,
  createRandomPiece,
  isValidMove,
  rotatePiece,
  mergePieceToBoard,
  clearCompletedRows,
} from "../utils/tetrisLogic";
import TetrisBoard from "./TetrisBoard";
import { Ionicons } from "@expo/vector-icons";
import { CustomDarkTheme } from "../../constants/theme";
import { interval, Subject } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { GAME_OVER_LINE } from "./TetrisBoard";
import GameOverOverlay from "./GameOverOverlay";
import {
  BASE_SPEED,
  SPEED_INCREASE_FACTOR,
  LEVEL_THRESHOLD,
} from "../constants/tetris";
import ScoreDisplay from "./ScoreDisplay";
import { BOARD_WIDTH } from "../constants/tetris";
import { useLocalSearchParams } from "expo-router";
import CameraPreview from "./CameraPreview";

const initialState: GameState = {
  currentPiece: null,
  board: createEmptyBoard(),
  score: 0,
  isGameOver: false,
  pendingClear: null,
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
        const completedRows = newBoard.reduce((acc, row, index) => {
          if (row.every((cell) => cell !== null)) {
            acc.push(index);
          }
          return acc;
        }, [] as number[]);

        if (completedRows.length > 0) {
          return {
            ...state,
            currentPiece: null,
            pendingClear: {
              board: newBoard,
              rows: completedRows,
            },
          };
        }

        return {
          ...state,
          currentPiece: null,
          board: newBoard,
        };
      }
      return state;

    case "UPDATE_BOARD":
      return {
        ...state,
        board: clearCompletedRows(action.board),
        score: state.score + action.scoreIncrease,
        pendingClear: null,
      };

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

        return {
          ...state,
          currentPiece: null,
          board: clearCompletedRows(newBoard),
        };
      }
      return state;

    case "NEW_PIECE":
      const blocksAboveLine = state.board
        .slice(0, GAME_OVER_LINE)
        .some((row) => row.some((cell) => cell !== null));

      if (blocksAboveLine) {
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

    case "CLEAR_ROWS": {
      const updatedBoard = clearCompletedRows(state.board);
      return {
        ...state,
        board: updatedBoard,
        score: state.score + action.rows.length * 100,
      };
    }

    default:
      return state;
  }
}

export default function TetrisGame() {
  const { useFacialControls } = useLocalSearchParams();
  const showFacialControls = useFacialControls === "true";
  const [gameState, dispatch] = useReducer(gameReducer, {
    ...initialState,
    pendingClear: null,
  });
  const gameOver$ = new Subject<void>();

  // Calculate current game speed based on score
  const currentSpeed = Math.max(
    BASE_SPEED *
      Math.pow(
        SPEED_INCREASE_FACTOR,
        Math.floor(gameState.score / LEVEL_THRESHOLD)
      ),
    100 // Minimum speed cap at 100ms
  );

  // First, add a state to track if soft drop is active
  const [isSoftDrop, setIsSoftDrop] = useState(false);

  // Modify the game loop to use a faster speed during soft drop
  useEffect(() => {
    if (gameState.isGameOver) {
      gameOver$.next();
      return;
    }

    // Use a faster speed during soft drop (e.g., 5x faster)
    const dropSpeed = isSoftDrop ? currentSpeed / 5 : currentSpeed * 2;

    const gameLoop$ = interval(dropSpeed).pipe(
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
  }, [gameState.isGameOver, currentSpeed, isSoftDrop]);

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

  // Handle row clearing animation
  useEffect(() => {
    if (gameState.pendingClear) {
      const { board: newBoard, rows: completedRows } = gameState.pendingClear;

      // First, show animation for the rows that will be cleared
      dispatch({
        type: "UPDATE_BOARD",
        board: newBoard.map((row, y) =>
          row.map((block) =>
            block && completedRows.includes(y)
              ? { ...block, isClearing: true }
              : block
          )
        ),
        scoreIncrease: 0,
      });

      // Then update the board after animation
      const timeoutId = setTimeout(() => {
        // Create a temporary array of all rows
        const allRows = [...newBoard];

        // Remove completed rows
        completedRows.sort((a, b) => b - a); // Sort in descending order
        completedRows.forEach((rowIndex) => {
          allRows.splice(rowIndex, 1);
        });

        // Add new empty rows at the top
        const emptyRows = Array(completedRows.length)
          .fill(null)
          .map(() => Array(BOARD_WIDTH).fill(null));
        allRows.unshift(...emptyRows);

        // Update block positions
        const updatedBoard = allRows.map((row, y) =>
          row.map((block) =>
            block ? { ...block, y, isClearing: false } : null
          )
        );

        dispatch({
          type: "UPDATE_BOARD",
          board: updatedBoard,
          scoreIncrease: completedRows.length * 100,
        });
      }, 200);

      return () => clearTimeout(timeoutId);
    }
  }, [gameState.pendingClear]);

  const moveLeft = useCallback(() => dispatch({ type: "MOVE_LEFT" }), []);
  const moveRight = useCallback(() => dispatch({ type: "MOVE_RIGHT" }), []);
  const rotate = useCallback(() => dispatch({ type: "ROTATE" }), []);
  const startSoftDrop = useCallback(() => setIsSoftDrop(true), []);
  const endSoftDrop = useCallback(() => setIsSoftDrop(false), []);

  return (
    <View style={styles.container}>
      <ScoreDisplay score={gameState.score} />
      <TetrisBoard gameState={gameState} />

      {showFacialControls && <CameraPreview />}

      {!showFacialControls && (
        <View style={styles.controls}>
          <TouchableOpacity onPress={moveLeft} style={styles.controlButton}>
            <Ionicons
              name="arrow-back"
              size={30}
              color={CustomDarkTheme.colors.secondary}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={rotate} style={styles.controlButton}>
            <Ionicons
              name="refresh"
              size={30}
              color={CustomDarkTheme.colors.secondary}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={moveRight} style={styles.controlButton}>
            <Ionicons
              name="arrow-forward"
              size={30}
              color={CustomDarkTheme.colors.secondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPressIn={startSoftDrop}
            onPressOut={endSoftDrop}
            style={styles.controlButton}
          >
            <Ionicons
              name="arrow-down"
              size={30}
              color={CustomDarkTheme.colors.secondary}
            />
          </TouchableOpacity>
        </View>
      )}

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
    justifyContent: "center",
    alignItems: "center",
  },
});
