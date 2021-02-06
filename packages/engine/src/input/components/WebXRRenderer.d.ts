import { Component } from '../../ecs/classes/Component';
export declare class WebXRRenderer extends Component<any> {
    static _schema: {
        context: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, any>;
        };
        requestAnimationFrame: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, any>;
            default: ((callback: FrameRequestCallback) => number) & typeof requestAnimationFrame;
        };
    };
}
