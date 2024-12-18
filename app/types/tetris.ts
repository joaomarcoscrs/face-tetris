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

type GameActionTypes =
  | "MOVE_LEFT"
  | "MOVE_RIGHT"
  | "ROTATE"
  | "MOVE_DOWN"
  | "HARD_DROP"
  | "NEW_PIECE"
  | "GAME_OVER"
  | "CLEAR_ROWS"
  | "UPDATE_BOARD";

export interface GameActionType {
  type: GameActionTypes;
  intensity?: number;
  piece?: TetrisPiece;
  rows?: number[];
  board?: (TetrisBlock | null)[][];
  scoreIncrease?: number;
}

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
