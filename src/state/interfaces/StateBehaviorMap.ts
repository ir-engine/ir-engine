import Behavior from "../../common/interfaces/Behavior"

export interface StateBehaviorMap {
  states?: {
    [key: number]: {
      behavior: Behavior
      args?: any
    }
  }
  blendspaces?: {
    [key: string]: {
      behavior: Behavior
      args?: any
    }
  }
}

export default StateBehaviorMap
