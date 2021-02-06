import { Box3 } from "three";
import { Component } from "../../ecs/classes/Component";
export declare class BoundingBox extends Component<BoundingBox> {
    box: Box3;
    boxArray: any[];
    dynamic: boolean;
    static _schema: {
        box: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, any>;
            default: Box3;
        };
        boxArray: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, any[]>;
            default: any[];
        };
        dynamic: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, boolean>;
            default: boolean;
        };
    };
}
