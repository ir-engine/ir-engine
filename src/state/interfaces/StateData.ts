import StateAlias from "../types/StateAlias"
import StateGroupType from "../types/StateGroupType"
import Behavior from "../../common/interfaces/Behavior"

export default interface StateData {
  groups: {
    [key: number]: {
      exclusive: boolean
      states: StateAlias[]
      default?: StateAlias
    }
  }
  states: {
    [key: number]: {
      group?: StateGroupType
      component?: any
      blockedBy?: StateAlias
      overrides?: StateAlias
      onAwake?: {
        behavior: Behavior
        args?: any
      }
      onUpdate?: {
        behavior: Behavior
        args?: any
      }
      onLateUpdate?: {
        behavior: Behavior
        args?: any
      }
      onDestroy?: {
        behavior: Behavior
        args?: any
      }
    }
  }
}
