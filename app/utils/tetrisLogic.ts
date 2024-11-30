import { BOARD_WIDTH, BOARD_HEIGHT, PIECES } from "../constants/tetris";
import { TetrisPiece, TetrisBlock, GameState } from "../types/tetris";

export const createEmptyBoard = () =>
  Array(BOARD_HEIGHT)
    .fill(null)
    .map(() => Array(BOARD_WIDTH).fill(null));

export const createRandomPiece = (): TetrisPiece => {
  const pieceTemplate = PIECES[Math.floor(Math.random() * PIECES.length)];
  return {
    blocks: pieceTemplate.blocks.map((block) => ({
      ...block,
      color: pieceTemplate.color,
    })),
    rotation: 0,
    x: Math.floor(BOARD_WIDTH / 2) - 1,
    y: 0,
  };
};

export const isValidMove = (
  piece: TetrisPiece,
  board: (TetrisBlock | null)[][],
  offsetX: number = 0,
  offsetY: number = 0
): boolean => {
  return piece.blocks.every((block) => {
    const newX = piece.x + block.x + offsetX;
    const newY = piece.y + block.y + offsetY;

    return (
      newX >= 0 &&
      newX < BOARD_WIDTH &&
      newY >= 0 &&
      newY < BOARD_HEIGHT &&
      !board[newY][newX]
    );
  });
};

export const rotatePiece = (piece: TetrisPiece): TetrisPiece => {
  const newBlocks = piece.blocks.map((block) => ({
    x: -block.y,
    y: block.x,
    color: block.color,
  }));

  return {
    ...piece,
    blocks: newBlocks,
    rotation: (piece.rotation + 90) % 360,
  };
};

export const mergePieceToBoard = (
  piece: TetrisPiece,
  board: (TetrisBlock | null)[][]
): (TetrisBlock | null)[][] => {
  const newBoard = board.map((row) => [...row]);

  piece.blocks.forEach((block) => {
    const newX = piece.x + block.x;
    const newY = piece.y + block.y;
    if (newY >= 0 && newY < BOARD_HEIGHT) {
      newBoard[newY][newX] = { ...block, x: newX, y: newY };
    }
  });

  return newBoard;
};

export const clearCompletedRows = (
  board: (TetrisBlock | null)[][]
): (TetrisBlock | null)[][] => {
  // Create a new board
  let newBoard = board.map((row) => [...row]);

  // Find completed rows
  const completedRows = board.reduce((acc, row, index) => {
    if (row.every((cell) => cell !== null)) {
      acc.push(index);
    }
    return acc;
  }, [] as number[]);

  // Remove completed rows and add new empty rows at the top
  if (completedRows.length > 0) {
    // Remove completed rows
    newBoard = newBoard.filter((_, index) => !completedRows.includes(index));

    // Add new empty rows at the top
    const newRows = Array(completedRows.length)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(null));

    newBoard = [...newRows, ...newBoard];

    // Update y-coordinates of remaining blocks
    newBoard = newBoard.map((row, y) =>
      row.map((block) => (block ? { ...block, y } : null))
    );
  }

  return newBoard;
};
