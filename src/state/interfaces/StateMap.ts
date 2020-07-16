import StateAlias from "../types/StateAlias"
import StateGroupType from "../types/StateGroupAlias"
import Behavior from "../../common/interfaces/Behavior"

export default interface StateMap {
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
      onAdded?: {
        behavior: Behavior
        args?: any
      }
      onChanged?: {
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
      onRemoved?: {
        behavior: Behavior
        args?: any
      }
    }
  }
}
