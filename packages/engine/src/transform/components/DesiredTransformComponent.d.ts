import { Component } from '../../ecs/classes/Component';
import { Vector3, Quaternion } from 'three';
export declare class DesiredTransformComponent extends Component<DesiredTransformComponent> {
    position: Vector3 | null;
    rotation: Quaternion | null;
    positionRate: number;
    rotationRate: number;
    constructor();
    copy(src: {
        position?: Vector3;
        rotation?: Quaternion;
    }): this;
    reset(): void;
}
