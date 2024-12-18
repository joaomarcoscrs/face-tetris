import { Subject } from "rxjs";
import { ControlAction } from "../types/tetris";

export const gameActionSubject = new Subject<ControlAction>();

export function mapFaceDirectionToGameAction(
  direction: string
): ControlAction | null {
  switch (direction) {
    case "looking_right":
      return "moveRight";
    case "looking_left":
      return "moveLeft";
    case "looking_up":
      return "rotateRight";
    case "looking_down":
      return "softDrop";
    case "looking_center":
      return "endSoftDrop";
    default:
      return null;
  }
}
