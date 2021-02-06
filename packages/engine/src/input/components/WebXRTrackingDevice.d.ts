import { Component } from '../../ecs/classes/Component';
export declare abstract class WebXRTrackingDevice extends Component<any> {
    static _schema: {
        pose: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, any>;
        };
        handId: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, number>;
        };
    };
}
