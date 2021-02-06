import { Component } from '../../ecs/classes/Component';
export declare class WebXRPointer extends Component<any> {
    static _schema: {
        pose: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, any>;
        };
        pointerMode: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, string>;
        };
    };
}
