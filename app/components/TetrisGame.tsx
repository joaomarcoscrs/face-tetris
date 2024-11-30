import React, { useReducer, useEffect, useCallback } from "react";
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
import { interval, Subject, fromEvent } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { GAME_OVER_LINE } from "./TetrisBoard";
import GameOverOverlay from "./GameOverOverlay";
import {
  BASE_SPEED,
  SPEED_INCREASE_FACTOR,
  LEVEL_THRESHOLD,
} from "../constants/tetris";
import ScoreDisplay from "./ScoreDisplay";
import { BOARD_WIDTH, BOARD_HEIGHT } from "../constants/tetris";

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
        board: action.board,
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
      // Create a temporary array of all non-completed rows
      const remainingRows = [];
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        if (!action.rows.includes(y)) {
          remainingRows.push(state.board[y]);
        }
      }

      // Create the new board starting with empty rows
      const updatedBoard = Array(BOARD_HEIGHT)
        .fill(null)
        .map(() => Array(BOARD_WIDTH).fill(null));

      // Fill the board from bottom to top
      let currentRow = BOARD_HEIGHT - 1;
      for (let i = remainingRows.length - 1; i >= 0; i--) {
        remainingRows[i].forEach((block, x) => {
          if (block) {
            updatedBoard[currentRow][x] = {
              ...block,
              y: currentRow,
            };
          }
        });
        currentRow--;
      }

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

  // Game loop using RxJS
  useEffect(() => {
    if (gameState.isGameOver) {
      gameOver$.next();
      return;
    }

    const gameLoop$ = interval(currentSpeed).pipe(
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
  }, [gameState.isGameOver, currentSpeed]);

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
  const hardDrop = useCallback(() => dispatch({ type: "HARD_DROP" }), []);

  return (
    <View style={styles.container}>
      <ScoreDisplay score={gameState.score} />
      <TetrisBoard gameState={gameState} />

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

        <TouchableOpacity onPress={hardDrop} style={styles.controlButton}>
          <Ionicons
            name="arrow-down"
            size={30}
            color={CustomDarkTheme.colors.secondary}
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
    justifyContent: "center",
    alignItems: "center",
  },
});
