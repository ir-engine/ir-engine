import { BehaviorValue } from '../../common/interfaces/BehaviorValue';
import { DomEventBehaviorValue } from "../../common/interfaces/DomEventBehaviorValue";
import { InputAlias } from '../types/InputAlias';
import { InputRelationship } from './InputRelationship';

export interface InputSchema {
  // Called by input system when an Input component is added
  onAdded: BehaviorValue[]; // Function
  // Called by input system when on Input component is removed
  onRemoved: BehaviorValue[]; // Function
  inputMap: Map<InputAlias, InputAlias>;
  inputButtonBehaviors: {
    // input name / alias
    [key: number]: {
      // binary state (on, off)
        started?: BehaviorValue[];
        continued?: BehaviorValue[];
        ended?: BehaviorValue[];
    };
  };
  inputAxisBehaviors: {
    // input name / alias
    [key: number]: {
      started?: BehaviorValue[];
      changed?: BehaviorValue[];
      unchanged?: BehaviorValue[];
    };
  };
}
