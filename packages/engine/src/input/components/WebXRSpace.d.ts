import { Component } from "../../ecs/classes/Component";
export declare class WebXRSpace extends Component<any> {
    static schema: {
        space: {
            type: import("../../ecs/types/Types").PropType<unknown, any>;
        };
        spaceType: {
            type: import("../../ecs/types/Types").PropType<unknown, string>;
        };
    };
}
