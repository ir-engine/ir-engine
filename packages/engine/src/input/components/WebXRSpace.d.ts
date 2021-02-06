import { Component } from '../../ecs/classes/Component';
export declare class WebXRSpace extends Component<any> {
    static _schema: {
        space: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, any>;
        };
        spaceType: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, string>;
        };
    };
}
