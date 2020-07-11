import Binary from "../../common/enums/Binary"
import { addState, removeState } from "../../state/behaviors/StateBehaviors"
import { mapAxisToBlendspace } from "../behaviors/AxisBehaviors"
import { DefaultStateTypes } from "../../state/defaults/DefaultStateTypes"
import DefaultBlendspaceTypes from "../../state/defaults/DefaultBlendspaceTypes"
import DefaultActions from "./DefaultActions"
import DefaultAxes from "./DefaultAxes"
import ActionData from "../interfaces/ActionData"

export const DefaultActionData: ActionData = {
  actions: {
    [DefaultActions.JUMP]: {
      [Binary.ON]: {
        behavior: addState,
        args: { stateType: DefaultStateTypes.JUMPING }
      }
    },
    [DefaultActions.CROUCH]: {
      [Binary.ON]: {
        behavior: addState,
        args: { stateType: DefaultStateTypes.CROUCHING }
      },
      [Binary.OFF]: {
        behavior: removeState,
        args: { stateType: DefaultStateTypes.CROUCHING }
      }
    },
    [DefaultActions.SPRINT]: {
      [Binary.ON]: {
        behavior: addState,
        args: { stateType: DefaultStateTypes.SPRINTING }
      },
      [Binary.OFF]: {
        behavior: removeState,
        args: { stateType: DefaultStateTypes.SPRINTING }
      }
    }
  },
  axes: {
    [DefaultAxes.MOVEMENT_PLAYERONE]: {
      behavior: mapAxisToBlendspace,
      args: { blendspace: DefaultBlendspaceTypes.MOVEMENT }
    },
    [DefaultAxes.SCREENXY]: {
      behavior: mapAxisToBlendspace,
      args: { blendspace: DefaultBlendspaceTypes.MOVEMENT }
    }
  }
}

export default DefaultActionData
