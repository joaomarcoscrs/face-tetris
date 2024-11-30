import { TetrisPieceColor } from "../types/tetris";
import { CustomDarkTheme } from "../../constants/theme";

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const BLOCK_SIZE = 30;

export const COLORS: Record<TetrisPieceColor, string> = {
  error: CustomDarkTheme.colors.error,
  accent: CustomDarkTheme.colors.accent,
  primary: CustomDarkTheme.colors.primary,
};

// Define piece shapes
export const PIECES = [
  // I piece
  {
    blocks: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ],
    color: "primary" as TetrisPieceColor,
  },
  // L piece
  {
    blocks: [
      { x: 0, y: 1 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ],
    color: "accent" as TetrisPieceColor,
  },
  // J piece
  {
    blocks: [
      { x: 2, y: 1 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ],
    color: "error" as TetrisPieceColor,
  },
  // O piece
  {
    blocks: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
    color: "primary" as TetrisPieceColor,
  },
  // T piece
  {
    blocks: [
      { x: 1, y: 1 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ],
    color: "accent" as TetrisPieceColor,
  },
];
