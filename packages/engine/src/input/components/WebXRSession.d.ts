import { Component } from '../../ecs/classes/Component';
export declare class WebXRSession extends Component<any> {
    static _schema: {
        session: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, any>;
        };
        isImmersive: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, boolean>;
            default: boolean;
        };
    };
}
