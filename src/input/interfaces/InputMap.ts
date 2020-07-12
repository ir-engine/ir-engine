import InputAlias from "../../input/types/InputAlias"
import { InputType } from "../enums/InputType"
import ButtonPriorityMap from "./InputPriorityMapping"
import { Scalar, Vector2, Vector3, NumericalType } from "../../common/types/NumericalTypes"

interface InputMap {
  // Called by input system when an Input component is added
  onAdded: [
    {
      behavior: any
      args?: any
    }
  ]
  // Called by input system when on Input component is removed
  onRemoved: [
    {
      behavior: any
      args?: any
    }
  ]
  // Bound to events on added, unbound on removed
  eventBindings?: {
    [key: string]: {
      behavior: any
      args?: {
        [key: string]: any
      }
    }
  }
  mouseInputMap?: {
    buttons?: {
      [key: string]: InputAlias
      [key: number]: InputAlias
    }
    input?: {
      [key: string]: InputAlias
      [key: number]: InputAlias
    }
  }
  gamepadInputMap?: {
    buttons?: {
      [key: string]: InputAlias
      [key: number]: InputAlias
    }
    input?: {
      [key: string]: InputAlias
      [key: number]: InputAlias
    }
  }
  keyboardInputMap?: {
    [key: string]: InputAlias
    [key: number]: InputAlias
  }
  buttonPriorities: {
    [key: string]: ButtonPriorityMap
  }
  inputButtonsToState: {
    // input name
    [key: string]: {
      // binary state (on, off)
      [key: string]: {
        behavior: any
        args: {
          input: InputAlias
          inputType: InputType
        }
      }
    }
    [key: number]: {
      // binary state (on, off)
      [key: number]: {
        behavior: any
        args: {
          input: InputAlias
          inputType: InputType
          value?: NumericalType
        }
      }
    }
  }
  inputAxesToState: {
    // input name
    [key: string]: {
      behavior: any
      args: {
        input: InputAlias
        inputType: InputType
        value?: NumericalType
      }
    }
  }
}

export default InputMap
