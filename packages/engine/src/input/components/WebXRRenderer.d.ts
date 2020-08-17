import { Component } from "../../ecs/classes/Component";
export declare class WebXRRenderer extends Component<any> {
    static schema: {
        context: {
            type: import("../../ecs/types/Types").PropType<unknown, any>;
        };
        requestAnimationFrame: {
            type: import("../../ecs/types/Types").PropType<unknown, any>;
            default: ((callback: FrameRequestCallback) => number) & typeof requestAnimationFrame;
        };
    };
}
