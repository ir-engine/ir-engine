import { Component } from "../../ecs/classes/Component";
export declare class WebXRSession extends Component<any> {
    static schema: {
        session: {
            type: import("../../ecs/types/Types").PropType<unknown, any>;
        };
        isImmersive: {
            type: import("../../ecs/types/Types").PropType<unknown, boolean>;
            default: boolean;
        };
    };
}
