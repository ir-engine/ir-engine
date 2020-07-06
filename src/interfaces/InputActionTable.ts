import ActionRules from "./ActionMapping"
import ActionType from "../types/ActionType"
import AxisType from "../types/AxisType"

const symbol: unique symbol = Symbol()

interface InputActionTable {
  rules: {
    [symbol]?: ActionRules
  }
  mouse?: {
    actions?: {
      [key: string]: ActionType
      [key: number]: ActionType
    }
    axes?: {
      [key: string]: AxisType
      [key: number]: AxisType
    }
  }
  keyboard?: {
    actions?: {
      [key: string]: ActionType
      [key: number]: ActionType
    }
    axes?: {
      [key: string]: AxisType
      [key: number]: AxisType
    }
  }
}

export default InputActionTable
