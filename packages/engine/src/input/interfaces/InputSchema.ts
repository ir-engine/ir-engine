import { BehaviorValue } from '../../common/interfaces/BehaviorValue';
import { InputAlias } from '../types/InputAlias';
import { InputRelationship } from './InputRelationship';
import { BinaryValue } from '../../common/enums/BinaryValue';
import { TouchInputs } from '../enums/TouchInputs';

export interface InputSchema {
  // Called by input system when an Input component is added
  onAdded: BehaviorValue[] // Function
  // Called by input system when on Input component is removed
  onRemoved: BehaviorValue[] // Function
  // Bound to events on added, unbound on removed
  eventBindings?: {
    [key: string]: BehaviorValue[]
  }
  cameraInputMap?:{
    [key: number]: InputAlias
  }
  mouseInputMap?: {
    buttons?: {
      [key: number]: InputAlias
    }
    axes?: {
      [key: number]: InputAlias
    }
  }
  touchInputMap?: {
    axes?: {
      [key: number]: InputAlias
    }
  }
  gamepadInputMap?: {
    buttons?: {
      [key: number]: InputAlias
    }
    axes?: {
      [key: number]: InputAlias
    }
  }
  keyboardInputMap?: {
    [key: string]: InputAlias
  }
  inputRelationships: {
    [key: number]: InputRelationship
  }
  inputButtonBehaviors: {
    // input name / alias
    [key: number]: {
      // binary state (on, off)
        started?: BehaviorValue[]
        continued?: BehaviorValue[]
        ended?: BehaviorValue[]
    }
  }
  inputAxisBehaviors: {
    // input name / alias
    [key: number]: {
      started?: BehaviorValue[]
      changed?: BehaviorValue[]
      unchanged?: BehaviorValue[]
    }
  }
}
