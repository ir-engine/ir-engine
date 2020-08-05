import InputAlias from "../../input/types/InputAlias";
import InputRelationshipMapping from "./InputRelationshipMapping";
interface behaviorEntry {
    behavior: any;
    args?: any;
}
interface InputMap {
    onAdded: [{
        behavior: any;
        args?: {
            [key: string]: any;
        };
    }];
    onRemoved: [{
        behavior: any;
        args?: {
            [key: string]: any;
        };
    }];
    eventBindings?: {
        [key: string]: {
            behaviors: behaviorEntry[];
        };
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
        [key: string]: InputRelationshipMapping;
    };
    inputButtonBehaviors: {
        [key: string]: {
            [key: string]: {
                behavior?: any;
                args?: {
                    [key: string]: any;
                };
                behaviors?: any;
            };
        };
        [key: number]: {
            [key: number]: {
                behavior?: any;
                args?: {
                    [key: string]: any;
                };
                behaviors?: any;
            };
        };
    };
    inputAxisBehaviors: {
        [key: string]: {
            behaviors: any;
        };
    };
}
export default InputMap;
