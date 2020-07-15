import StateMap from "../interfaces/StateMap"
import { Idle } from "../../common/defaults/components/Idle"
import { Moving } from "../../common/defaults/components/Moving"
import Jumping from "../../common/defaults/components/Jumping"
import { Crouching } from "../../common/defaults/components/Crouching"
import { Sprinting } from "../../common/defaults/components/Sprinting"
import { jump } from "../../common/defaults/behaviors/jump"
import { decelerate } from "../../common/defaults/behaviors/decelerate"

export const DefaultStateTypes = {
  // Main States
  IDLE: 0,
  MOVING: 1,
  JUMPING: 2,
  FALLING: 3,

  // Modifier States
  CROUCHING: 4,
  WALKING: 5,
  SPRINTING: 6,
  INTERACTING: 7,

  // Moving substates
  MOVING_FORWARD: 8,
  MOVING_BACKWARD: 9,
  MOVING_LEFT: 10,
  MOVING_RIGHT: 11
}

export const DefaultStateGroups = {
  MOVEMENT: 0,
  MOVEMENT_MODIFIERS: 1
}

export const DefaultStateMap: StateMap = {
  groups: {
    [DefaultStateGroups.MOVEMENT]: {
      exclusive: true,
      default: DefaultStateTypes.IDLE,
      states: [DefaultStateTypes.IDLE, DefaultStateTypes.MOVING]
    },
    [DefaultStateGroups.MOVEMENT_MODIFIERS]: {
      exclusive: true,
      states: [DefaultStateTypes.CROUCHING, DefaultStateTypes.SPRINTING, DefaultStateTypes.JUMPING]
    }
  },
  states: {
    [DefaultStateTypes.IDLE]: { group: DefaultStateGroups.MOVEMENT, component: Idle, onUpdate: { behavior: decelerate } },
    [DefaultStateTypes.MOVING]: {
      group: DefaultStateGroups.MOVEMENT,
      component: Moving
    },
    [DefaultStateTypes.JUMPING]: { group: DefaultStateGroups.MOVEMENT_MODIFIERS, component: Jumping, onUpdate: { behavior: jump } },
    [DefaultStateTypes.CROUCHING]: { group: DefaultStateGroups.MOVEMENT_MODIFIERS, component: Crouching, blockedBy: DefaultStateTypes.JUMPING },
    [DefaultStateTypes.SPRINTING]: { group: DefaultStateGroups.MOVEMENT_MODIFIERS, component: Sprinting }
  }
}
