export type TetrisPieceColor = "error" | "accent" | "primary";

export interface TetrisBlock {
  x: number;
  y: number;
  color: TetrisPieceColor;
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
}

export type GameAction =
  | { type: "MOVE_LEFT" }
  | { type: "MOVE_RIGHT" }
  | { type: "ROTATE" }
  | { type: "MOVE_DOWN" }
  | { type: "HARD_DROP" }
  | { type: "NEW_PIECE"; piece: TetrisPiece }
  | { type: "GAME_OVER" }
  | { type: "CLEAR_ROWS"; rows: number[] };
