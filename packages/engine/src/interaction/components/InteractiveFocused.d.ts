import { Component } from "../../ecs/classes/Component";
import { Entity } from "../../ecs/classes/Entity";
export declare class InteractiveFocused extends Component<InteractiveFocused> {
    interacts: Entity;
    static _schema: {
        interacts: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, any>;
        };
    };
}
