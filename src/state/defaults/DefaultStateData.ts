import DefaultStateGroups from "./DefaultStateGroups"
import DefaultStateTypes from "./DefaultStateTypes"
import StateData from "../interfaces/StateData"
import { Idle } from "../../common/defaults/components/Idle"
import { Moving } from "../../common/defaults/components/Moving"
import Jumping from "../../common/defaults/components/Jumping"
import { Crouching } from "../../common/defaults/components/Crouching"
import { Sprinting } from "../../common/defaults/components/Sprinting"

export const DefaultStateGroupData: StateData = {
  groups: {
    [DefaultStateGroups.MOVEMENT]: {
      exclusive: true,
      default: DefaultStateTypes.IDLE,
      states: [DefaultStateTypes.IDLE, DefaultStateTypes.MOVING, DefaultStateTypes.JUMPING, DefaultStateTypes.FALLING]
    },
    [DefaultStateGroups.MOVEMENT_MODIFIERS]: {
      exclusive: true,
      states: [DefaultStateTypes.CROUCHING, DefaultStateTypes.SPRINTING]
    }
  },
  stateData: {
    [DefaultStateTypes.IDLE]: { group: DefaultStateGroups.MOVEMENT, component: Idle },
    [DefaultStateTypes.MOVING]: { group: DefaultStateGroups.MOVEMENT, component: Moving },
    [DefaultStateTypes.JUMPING]: { group: DefaultStateGroups.MOVEMENT, component: Jumping },
    [DefaultStateTypes.CROUCHING]: { group: DefaultStateGroups.MOVEMENT_MODIFIERS, component: Crouching, blockedBy: DefaultStateTypes.JUMPING },
    [DefaultStateTypes.SPRINTING]: { group: DefaultStateGroups.MOVEMENT_MODIFIERS, component: Sprinting }
  }
}

export default DefaultStateGroupData
