import StateType from "../../state/types/StateAlias"
import InputRules from "./InputRules"

export interface InputMap {
  rules: {
    [key: string]: InputRules
  }
  buttonInput: {
    // input name
    [key: string]: {
      // binary state (on, off)
      [key: string]: {
        behavior: any
        args: { state: StateType }
      }
    }
    [key: number]: {
      // binary state (on, off)
      [key: number]: {
        behavior: any
        args: { state: StateType }
      }
    }
  }
  continuousInput: {
    // input name
    [key: string]: {
      behavior: any
      args: { state: StateType }
    }
    [key: number]: {
      behavior: any
      args: { state: StateType }
    }
  }
}

export default InputMap
