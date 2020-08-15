import { BehaviorValue } from "../../common/interfaces/BehaviorValue"
import { InputAlias } from "../../input/types/InputAlias"
import { InputRelationship } from "./InputRelationship"

export interface InputSchema {
  // Called by input system when an Input component is added
  onAdded: BehaviorValue[] // Function
  // Called by input system when on Input component is removed
  onRemoved: BehaviorValue[] // Function
  // Bound to events on added, unbound on removed
  eventBindings?: {
    [key: string]: BehaviorValue[]
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
        started?: BehaviorValue[]
        continued?: BehaviorValue[]
      }
    }
    [key: number]: {
      // binary state (on, off)
      [key: number]: {
        started?: BehaviorValue[]
        continued?: BehaviorValue[]
      }
    }
  }
  inputAxisBehaviors: {
    // input name / alias
    [key: string]: {
      started?: BehaviorValue[]
      continued?: BehaviorValue[]
    }
  }
}
