import { Vector3, PerspectiveCamera } from "three";
import InputManager from "./InputManager";
export default class FlyControls {
    enabled: boolean;
    camera: any;
    inputManager: any;
    moveSpeed: number;
    boostSpeed: number;
    lookSensitivity: number;
    maxXRotation: any;
    direction: Vector3;
    onMouseUp: (e: any) => void;
    constructor(camera: PerspectiveCamera, inputManager: InputManager);
    enable(): void;
    disable(): void;
    update(dt: any): void;
}
