import { BehaviorValue } from "../../common/interfaces/BehaviorValue";
import { InputAlias } from "../types/InputAlias";
import { InputRelationship } from "./InputRelationship";
export interface InputSchema {
    onAdded: BehaviorValue[];
    onRemoved: BehaviorValue[];
    eventBindings?: {
        [key: string]: BehaviorValue[];
    };
    mouseInputMap?: {
        buttons?: {
            [key: string]: InputAlias;
            [key: number]: InputAlias;
        };
        axes?: {
            [key: string]: InputAlias;
            [key: number]: InputAlias;
        };
    };
    gamepadInputMap?: {
        buttons?: {
            [key: string]: InputAlias;
            [key: number]: InputAlias;
        };
        axes?: {
            [key: string]: InputAlias;
            [key: number]: InputAlias;
        };
    };
    keyboardInputMap?: {
        [key: string]: InputAlias;
        [key: number]: InputAlias;
    };
    inputRelationships: {
        [key: string]: InputRelationship;
    };
    inputButtonBehaviors: {
        [key: string]: {
            [key: string]: {
                started?: BehaviorValue[];
                continued?: BehaviorValue[];
            };
        };
        [key: number]: {
            [key: number]: {
                started?: BehaviorValue[];
                continued?: BehaviorValue[];
            };
        };
    };
    inputAxisBehaviors: {
        [key: string]: {
            started?: BehaviorValue[];
            continued?: BehaviorValue[];
        };
    };
}
