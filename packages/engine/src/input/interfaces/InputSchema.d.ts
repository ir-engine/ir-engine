import { BehaviorValue } from '../../common/interfaces/BehaviorValue';
import { DomEventBehaviorValue } from "../../common/interfaces/DomEventBehaviorValue";
import { InputAlias } from '../types/InputAlias';
import { InputRelationship } from './InputRelationship';
export interface InputSchema {
    onAdded: BehaviorValue[];
    onRemoved: BehaviorValue[];
    eventBindings?: {
        [key: string]: DomEventBehaviorValue[];
    };
    cameraInputMap?: {
        [key: number]: InputAlias;
    };
    mouseInputMap?: {
        buttons?: {
            [key: number]: InputAlias;
        };
        axes?: {
            [key: number]: InputAlias;
        };
    };
    touchInputMap?: {
        buttons?: {
            [key: number]: InputAlias;
        };
        axes?: {
            [key: number]: InputAlias;
        };
    };
    gamepadInputMap?: {
        buttons?: {
            [key: number]: InputAlias;
        };
        axes?: {
            [key: number]: InputAlias;
        };
    };
    keyboardInputMap?: {
        [key: string]: InputAlias;
    };
    inputRelationships: {
        [key: number]: InputRelationship;
    };
    inputButtonBehaviors: {
        [key: number]: {
            started?: BehaviorValue[];
            continued?: BehaviorValue[];
            ended?: BehaviorValue[];
        };
    };
    inputAxisBehaviors: {
        [key: number]: {
            started?: BehaviorValue[];
            changed?: BehaviorValue[];
            unchanged?: BehaviorValue[];
        };
    };
}
