import { Component } from '../../ecs/classes/Component';
export declare class WebXRViewPoint extends Component<any> {
    static _schema: {
        pose: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, any>;
        };
    };
}
