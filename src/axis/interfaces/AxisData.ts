import StateType from "../../state/types/StateAlias"
import AxisRules from "./AxisRules"

export interface AxisData {
  rules: {
    [key: string]: AxisRules
  }
  buttonAxes: {
    // axis name
    [key: string]: {
      // binary state (on, off)
      [key: string]: {
        behavior: any
        args: { state: StateType }
      }
    }
  }
  continuousAxes: {
    // axis name
    [key: string]: {
      behavior: any
      args: { state: StateType }
    }
  }
}

export default AxisData
