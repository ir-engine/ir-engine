import StateType from "../types/StateType"
import StateGroupType from "../types/StateGroupType"

export default interface StateData {
  groups: {
    [key: number]: {
      exclusive: boolean
      states: StateType[]
      default?: StateType
    }
  }
  stateData: {
    [key: number]: {
      group?: StateGroupType
      component?: any
      blockedBy?: StateType
      overrides?: StateType
    }
  }
}
