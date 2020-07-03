import ActionMapping from "./ActionMapping"
import ActionType from "../types/ActionType"
import AxisType from "../types/AxisType"

const symbol: unique symbol = Symbol()

interface InputMap {
  actionMap?: {
    [symbol]?: ActionMapping
  }
  mouse?: {
    actions?: {
      [key: string]: ActionType
    }
    axes?: {
      [key: string]: AxisType
    }
  }
  keyboard?: {
    actions?: {
      [key: string]: ActionType
    }
    axes?: {
      [key: string]: AxisType
    }
  }
}

export default InputMap
