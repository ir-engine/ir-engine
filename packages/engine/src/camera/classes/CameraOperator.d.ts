import { Camera, Vector2, Vector3 } from 'three';
export declare class CameraOperator {
    target: Vector3;
    sensitivity: Vector2;
    radius: number;
    theta: number;
    phi: number;
    onMouseDownPosition: Vector2;
    onMouseDownTheta: any;
    onMouseDownPhi: any;
    targetRadius: number;
    movementSpeed: number;
    upVelocity: number;
    forwardVelocity: number;
    rightVelocity: number;
    followMode: boolean;
    constructor(camera: Camera, sensitivityX?: number, sensitivityY?: number);
    setSensitivity(sensitivityX: number, sensitivityY?: number): void;
    setRadius(value: number, instantly?: boolean): void;
    move(deltaX: number, deltaY: number): void;
    update(): void;
}
