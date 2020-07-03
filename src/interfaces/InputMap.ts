import ActionMapping from "./ActionMapping"
import ActionType from "../types/ActionType"
import AxisType from "../types/AxisType"

const symbol: unique symbol = Symbol()

interface InputMap {
  actionMap: {
    [symbol]?: ActionMapping
  }
  mouse?: {
    actions?: {
      [key: number]: ActionType
      [key: string]: ActionType
    }
    axes?: {
      [key: number]: AxisType
      [key: string]: AxisType
    }
  }
  keyboard?: {
    actions?: {
      [key: number]: ActionType
      [key: string]: ActionType
    }
    axes?: {
      [key: number]: AxisType
      [key: string]: AxisType
    }
  }
}

export default InputMap
