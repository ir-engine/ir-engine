import { DefaultStateTypes } from "./DefaultStateTypes"
import DefaultBlendspaceTypes from "./DefaultBlendspaceTypes"
import StateBehaviorMap from "../interfaces/StateBehaviorMap"
import { jump } from "../../common/defaults/behaviors/jump"
import { move } from "../../common/defaults/behaviors/move"
import { decelerate } from "../../common/defaults/behaviors/decelerate"

const DefaultStateTransformationData: StateBehaviorMap = {
  states: {
    [DefaultStateTypes.JUMPING]: {
      behavior: jump
    },
    [DefaultStateTypes.IDLE]: {
      behavior: decelerate
    }
  },
  blendspaces: {
    [DefaultBlendspaceTypes.MOVEMENT]: {
      behavior: move
    }
  }
}

export default DefaultStateTransformationData
