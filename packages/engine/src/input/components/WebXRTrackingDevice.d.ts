import { Component } from "../../ecs/classes/Component";
export declare abstract class WebXRTrackingDevice extends Component<any> {
    static schema: {
        pose: {
            type: import("../../ecs/types/Types").PropType<unknown, any>;
        };
        handId: {
            type: import("../../ecs/types/Types").PropType<unknown, number>;
        };
    };
}
