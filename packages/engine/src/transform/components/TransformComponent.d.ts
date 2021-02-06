import { Component } from '../../ecs/classes/Component';
import { Vector3, Quaternion } from 'three';
export declare class TransformComponent extends Component<TransformComponent> {
    position: Vector3;
    rotation: Quaternion;
    velocity: Vector3;
    scale: Vector3;
    static _schema: {
        position: {
            default: Vector3;
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, any>;
        };
        rotation: {
            default: Quaternion;
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, any>;
        };
        velocity: {
            default: Vector3;
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, any>;
        };
        scale: {
            default: Vector3;
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, any>;
        };
    };
    constructor();
    copy(src: {
        position?: Vector3;
        rotation?: Quaternion;
        scale?: Vector3;
        velocity?: Vector3;
    }): this;
    reset(): void;
}
