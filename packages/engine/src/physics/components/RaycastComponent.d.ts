import { Vector3 } from 'three';
import { Component } from '../../ecs/classes/Component';
export default class RaycastComponent extends Component<RaycastComponent> {
    position: Vector3;
    direction: Vector3;
    near: number;
    far: number;
    static _schema: {
        position: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, number[]>;
        };
        direction: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, number[]>;
        };
        near: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, number>;
            default: number;
        };
        far: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, number>;
            default: number;
        };
    };
}
