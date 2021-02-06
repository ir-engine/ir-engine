import { Component } from "../../ecs/classes/Component";
import { Entity } from "../../ecs/classes/Entity";
export declare class SubFocused extends Component<SubFocused> {
    subInteracts: Entity;
    static _schema: {
        subInteracts: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, any>;
        };
    };
}
