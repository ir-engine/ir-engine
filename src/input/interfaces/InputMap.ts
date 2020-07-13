import InputAlias from "../../input/types/InputAlias"
import ButtonPriorityMap from "./InputPriorityMapping"

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
  inputButtonBehaviors: {
    // input name
    [key: string]: {
      // binary state (on, off)
      [key: string]: {
        behavior: any
        args?: {
          [key: string]: any
        }
      }
    }
    [key: number]: {
      // binary state (on, off)
      [key: number]: {
        behavior: any
        args: {
          [key: string]: any
        }
      }
    }
  }
  inputAxisBehaviors: {
    // input name
    [key: string]: {
      behavior: any
      args: {
        [key: string]: any
      }
    }
  }
}

export default InputMap
