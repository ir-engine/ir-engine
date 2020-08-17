import { Component } from "../../ecs/classes/Component";
export declare class WebXRViewPoint extends Component<any> {
    static schema: {
        pose: {
            type: import("../../ecs/types/Types").PropType<unknown, any>;
        };
    };
}
