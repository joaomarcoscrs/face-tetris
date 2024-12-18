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
import { router } from "expo-router";
import BackButton from "./BackButton";
import { DirectionAction, gameActionSubject } from "../utils/gameControls";
import { GameActionType, ControlAction } from "../types/tetris";

const initialState: GameState = {
  currentPiece: null,
  board: createEmptyBoard(),
  score: 0,
  isGameOver: false,
  pendingClear: null,
};

function gameReducer(state: GameState, action: GameActionType): GameState {
  switch (action.type) {
    case "MOVE_LEFT":
      if (state.currentPiece) {
        const moveAmount = action.intensity || 1;
        let newX = state.currentPiece.x;
        // Try to move by the full amount, but stop if we hit something
        while (
          newX > state.currentPiece.x - moveAmount &&
          isValidMove({ ...state.currentPiece, x: newX - 1 }, state.board)
        ) {
          newX--;
        }
        if (newX !== state.currentPiece.x) {
          return {
            ...state,
            currentPiece: {
              ...state.currentPiece,
              x: newX,
            },
          };
        }
      }
      return state;

    case "MOVE_RIGHT":
      if (state.currentPiece) {
        const moveAmount = action.intensity || 1;
        let newX = state.currentPiece.x;
        // Try to move by the full amount, but stop if we hit something
        while (
          newX < state.currentPiece.x + moveAmount &&
          isValidMove({ ...state.currentPiece, x: newX + 1 }, state.board)
        ) {
          newX++;
        }
        if (newX !== state.currentPiece.x) {
          return {
            ...state,
            currentPiece: {
              ...state.currentPiece,
              x: newX,
            },
          };
        }
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

    // Use a faster speed during soft drop (e.g., 2x faster)
    const dropSpeed = isSoftDrop ? currentSpeed / 2 : currentSpeed;

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

  const handleGoBack = useCallback(() => {
    if (gameOver$) {
      gameOver$.next();
      gameOver$.complete();
    }
    router.back();
  }, [gameOver$]);

  useEffect(() => {
    const subscription = gameActionSubject.subscribe(
      (control: DirectionAction) => {
        switch (control.action) {
          case "moveLeft":
            dispatch({ type: "MOVE_LEFT", intensity: control.intensity });
            break;
          case "moveRight":
            dispatch({ type: "MOVE_RIGHT", intensity: control.intensity });
            break;
          case "rotateRight":
            dispatch({ type: "ROTATE" });
            break;
          case "softDrop":
            setIsSoftDrop(true);
            break;
          case "endSoftDrop":
            setIsSoftDrop(false);
            break;
          case "hardDrop":
            dispatch({ type: "HARD_DROP" });
            break;
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <BackButton onPress={handleGoBack} />
      <ScoreDisplay score={gameState.score} />
      <TetrisBoard gameState={gameState} />

      {showFacialControls && <CameraPreview />}

      {!showFacialControls && (
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={() => dispatch({ type: "MOVE_LEFT" })}
            style={styles.controlButton}
          >
            <Ionicons
              name="arrow-back"
              size={30}
              color={CustomDarkTheme.colors.secondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => dispatch({ type: "ROTATE" })}
            style={styles.controlButton}
          >
            <Ionicons
              name="refresh"
              size={30}
              color={CustomDarkTheme.colors.secondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => dispatch({ type: "MOVE_RIGHT" })}
            style={styles.controlButton}
          >
            <Ionicons
              name="arrow-forward"
              size={30}
              color={CustomDarkTheme.colors.secondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPressIn={() => setIsSoftDrop(true)}
            onPressOut={() => setIsSoftDrop(false)}
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
