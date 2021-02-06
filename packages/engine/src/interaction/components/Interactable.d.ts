import { Component } from "../../ecs/classes/Component";
import { Behavior } from "../../common/interfaces/Behavior";
import { InteractionCheckHandler } from "../types/InteractionTypes";
export declare class Interactable extends Component<Interactable> {
    static _schema: {
        interactiveDistance: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, number>;
            default: number;
        };
        onInteractionCheck: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, any>;
        };
        onInteractionFocused: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, any>;
        };
        onInteraction: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, any>;
        };
        interactionParts: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, any[]>;
        };
        data: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, any>;
        };
    };
    onInteractionCheck: InteractionCheckHandler;
    onInteraction: Behavior;
    onInteractionFocused: Behavior;
    interactiveDistance: number;
    interactionParts: Array<any>;
    data: any;
}
