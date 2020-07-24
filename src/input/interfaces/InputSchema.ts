import InputAlias from "../types/InputAlias"
import InputRelationshipMapping from "./InputRelationship"

interface InputSchema {
  // Called by input system when an Input component is added
  onAdded: [
    {
      behavior: any // Function
      args?: {
        [key: string]: any
      }
    }
  ]
  // Called by input system when on Input component is removed
  onRemoved: [
    {
      behavior: any // Function
      args?: {
        [key: string]: any
      }
    }
  ]
  // Bound to events on added, unbound on removed
  eventBindings?: {
    [key: string]: {
      behavior: any // Function
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
    axes?: {
      [key: string]: InputAlias
      [key: number]: InputAlias
    }
  }
  gamepadInputMap?: {
    buttons?: {
      [key: string]: InputAlias
      [key: number]: InputAlias
    }
    axes?: {
      [key: string]: InputAlias
      [key: number]: InputAlias
    }
  }
  keyboardInputMap?: {
    [key: string]: InputAlias
    [key: number]: InputAlias
  }
  inputRelationships: {
    [key: string]: InputRelationshipMapping
  }
  inputButtonBehaviors: {
    // input name / alias
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
    // input name / alias
    [key: string]: {
      behavior: any
      args: {
        [key: string]: any
      }
    }
  }
}

export default InputSchema
