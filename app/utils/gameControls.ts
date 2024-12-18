import { Subject } from "rxjs";
import { ControlAction } from "../types/tetris";

export interface DirectionAction {
  action: ControlAction;
  intensity: number;
}

export const gameActionSubject = new Subject<DirectionAction>();

export function mapFaceDirectionToGameAction(response: {
  action: string;
  intensity?: number;
}): DirectionAction | null {
  const intensity = response.intensity || 1;

  switch (response.action) {
    case "looking_right":
      return {
        action: "moveRight",
        intensity: Math.min(Math.ceil(intensity * 3), 3),
      };
    case "looking_left":
      return {
        action: "moveLeft",
        intensity: Math.min(Math.ceil(intensity * 3), 3),
      };
    case "looking_up":
      return { action: "rotateRight", intensity: 1 };
    case "looking_down":
      return { action: "softDrop", intensity: 1 };
    case "looking_center":
      return { action: "endSoftDrop", intensity: 1 };
    default:
      return null;
  }
}
