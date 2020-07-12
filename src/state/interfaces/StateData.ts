import StateType from "../types/StateType"
import StateGroupType from "../types/StateGroupType"
import Behavior from "../../common/interfaces/Behavior"

export default interface StateData {
  groups: {
    [key: number]: {
      exclusive: boolean
      states: StateType[]
      default?: StateType
    }
  }
  states: {
    [key: number]: {
      group?: StateGroupType
      component?: any
      blockedBy?: StateType
      overrides?: StateType
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