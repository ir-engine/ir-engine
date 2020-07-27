import InputAlias from "../types/InputAlias";
import InputRelationshipMapping from "./InputRelationship";
interface InputSchema {
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
            behavior: any;
            args?: {
                [key: string]: any;
            };
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
                behavior: any;
                args?: {
                    [key: string]: any;
                };
            };
        };
        [key: number]: {
            [key: number]: {
                behavior: any;
                args: {
                    [key: string]: any;
                };
            };
        };
    };
    inputAxisBehaviors: {
        [key: string]: {
            behavior: any;
            args: {
                [key: string]: any;
            };
        };
    };
}
export default InputSchema;
