export type TetrisPieceColor = "error" | "accent" | "primary";

export interface TetrisBlock {
  x: number;
  y: number;
  color: TetrisPieceColor;
  isClearing?: boolean;
}

export interface TetrisPiece {
  blocks: TetrisBlock[];
  rotation: number;
  x: number;
  y: number;
}

export interface GameState {
  currentPiece: TetrisPiece | null;
  board: (TetrisBlock | null)[][];
  score: number;
  isGameOver: boolean;
  pendingClear: {
    board: (TetrisBlock | null)[][];
    rows: number[];
  } | null;
}

export type GameActionType =
  | { type: "MOVE_LEFT" }
  | { type: "MOVE_RIGHT" }
  | { type: "ROTATE" }
  | { type: "MOVE_DOWN" }
  | { type: "HARD_DROP" }
  | { type: "NEW_PIECE"; piece: TetrisPiece }
  | { type: "GAME_OVER" }
  | { type: "CLEAR_ROWS"; rows: number[] }
  | {
      type: "UPDATE_BOARD";
      board: (TetrisBlock | null)[][];
      scoreIncrease: number;
    };

// This is what we'll use for external controls (facial/touch)
export type ControlAction =
  | "moveLeft"
  | "moveRight"
  | "rotateRight"
  | "softDrop"
  | "endSoftDrop"
  | "hardDrop";

export interface GameProps {
  useFacialControls?: boolean;
}
