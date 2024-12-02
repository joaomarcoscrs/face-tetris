import { Subject } from "rxjs";

export type GameAction =
  | "moveLeft"
  | "moveRight"
  | "rotateRight"
  | "softDrop"
  | "hardDrop";

// Create a subject to emit game actions
export const gameActionSubject = new Subject<GameAction>();

// Map face directions to game actions
export function mapFaceDirectionToGameAction(
  direction: string
): GameAction | null {
  switch (direction) {
    case "looking_left":
      return "moveLeft";
    case "looking_right":
      return "moveRight";
    case "looking_up":
      return "rotateRight";
    default:
      return null;
  }
}
