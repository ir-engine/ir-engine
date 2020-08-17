import { Component } from "../../ecs/classes/Component";
export declare class WebXRPointer extends Component<any> {
    static schema: {
        pose: {
            type: import("../../ecs/types/Types").PropType<unknown, any>;
        };
        pointerMode: {
            type: import("../../ecs/types/Types").PropType<unknown, string>;
        };
    };
}
