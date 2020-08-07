import InputAlias from "../../input/types/InputAlias"
import InputRelationship from "./InputRelationship"

interface BehaviorEntry {
  behavior: any
  args?: any
}

interface InputSchema {
  // Called by input system when an Input component is added
  onAdded: BehaviorEntry[] // Function
  // Called by input system when on Input component is removed
  onRemoved: BehaviorEntry[] // Function
  // Bound to events on added, unbound on removed
  eventBindings?: {
    [key: string]: BehaviorEntry[]
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
    [key: string]: InputRelationship
  }
  inputButtonBehaviors: {
    // input name / alias
    [key: string]: {
      // binary state (on, off)
      [key: string]: {
        started?: BehaviorEntry[]
        continued?: BehaviorEntry[]
      }
    }
    [key: number]: {
      // binary state (on, off)
      [key: number]: {
        started?: BehaviorEntry[]
        continued?: BehaviorEntry[]
      }
    }
  }
  inputAxisBehaviors: {
    // input name / alias
    [key: string]: {
      started?: BehaviorEntry[]
      continued?: BehaviorEntry[]
    }
  }
}

export default InputSchema
