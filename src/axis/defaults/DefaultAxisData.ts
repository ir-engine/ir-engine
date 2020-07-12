import Binary from "../../common/enums/Binary"
import { addState, removeState } from "../../state/behaviors/StateBehaviors"
import { mapAxisToState } from "../behaviors/mapAxisToState"
import DefaultStateTypes from "../../state/defaults/DefaultStateTypes"
import AxisData from "../interfaces/AxisData"
import AxisRules from "../interfaces/AxisRules"

export const DefaultAxes = {
  PRIMARY: 0,
  SECONDARY: 1,
  FORWARD: 2,
  BACKWARD: 3,
  UP: 4,
  DOWN: 5,
  LEFT: 6,
  RIGHT: 7,
  INTERACT: 8,
  CROUCH: 9,
  JUMP: 10,
  WALK: 11,
  RUN: 12,
  SPRINT: 13,
  SNEAK: 14,
  SCREENXY: 15, // Is this too specific, or useful?
  MOVEMENT_PLAYERONE: 16,
  LOOKTURN_PLAYERONE: 17,
  MOVEMENT_PLAYERTWO: 18,
  LOOKTURN_PLAYERTWO: 19,
  ALTERNATE: 20
}

export const DefaultAxisData: AxisData = {
  rules: {
    [DefaultAxes.FORWARD]: { opposes: [DefaultAxes.BACKWARD] } as AxisRules,
    [DefaultAxes.BACKWARD]: { opposes: [DefaultAxes.FORWARD] } as AxisRules,
    [DefaultAxes.LEFT]: { opposes: [DefaultAxes.RIGHT] } as AxisRules,
    [DefaultAxes.RIGHT]: { opposes: [DefaultAxes.LEFT] } as AxisRules,
    [DefaultAxes.CROUCH]: { blockedBy: [DefaultAxes.JUMP, DefaultAxes.SPRINT] } as AxisRules,
    [DefaultAxes.JUMP]: { overrides: [DefaultAxes.CROUCH] } as AxisRules,
    [DefaultAxes.SPRINT]: { blockedBy: [DefaultAxes.JUMP], overrides: [DefaultAxes.CROUCH] } as AxisRules,
    [DefaultAxes.WALK]: { blockedBy: [DefaultAxes.JUMP, DefaultAxes.SPRINT], overrides: [DefaultAxes.CROUCH] } as AxisRules,
    [DefaultAxes.INTERACT]: { blockedBy: [DefaultAxes.JUMP] } as AxisRules
  },
  buttonAxes: {
    [DefaultAxes.JUMP]: {
      [Binary.ON]: {
        behavior: addState,
        args: { state: DefaultStateTypes.JUMPING }
      }
    },
    [DefaultAxes.CROUCH]: {
      [Binary.ON]: {
        behavior: addState,
        args: { state: DefaultStateTypes.CROUCHING }
      },
      [Binary.OFF]: {
        behavior: removeState,
        args: { state: DefaultStateTypes.CROUCHING }
      }
    },
    [DefaultAxes.SPRINT]: {
      [Binary.ON]: {
        behavior: addState,
        args: { state: DefaultStateTypes.SPRINTING }
      },
      [Binary.OFF]: {
        behavior: removeState,
        args: { state: DefaultStateTypes.SPRINTING }
      }
    }
  },
  continuousAxes: {
    [DefaultAxes.MOVEMENT_PLAYERONE]: {
      behavior: mapAxisToState,
      args: { state: DefaultStateTypes.MOVING }
    },
    [DefaultAxes.SCREENXY]: {
      behavior: mapAxisToState,
      args: { state: DefaultStateTypes.MOVING }
    }
  }
}

export default DefaultAxisData
