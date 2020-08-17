import { Vector3 } from "three";
import { Component } from "../../ecs/classes/Component";
export default class RaycastComponent extends Component<RaycastComponent> {
    position: Vector3;
    direction: Vector3;
    near: number;
    far: number;
    static schema: {
        position: {
            type: import("../../ecs/types/Types").PropType<unknown, number[]>;
        };
        direction: {
            type: import("../../ecs/types/Types").PropType<unknown, number[]>;
        };
        near: {
            type: import("../../ecs/types/Types").PropType<unknown, number>;
            default: number;
        };
        far: {
            type: import("../../ecs/types/Types").PropType<unknown, number>;
            default: number;
        };
    };
}
