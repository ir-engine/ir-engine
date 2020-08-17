import { Component } from "../../ecs/classes/Component";
export declare class CameraComponent extends Component<CameraComponent> {
    static instance: CameraComponent;
    camera: any;
    followTarget: any;
    fov: number;
    aspect: number;
    near: number;
    far: number;
    layers: number;
    handleResize: boolean;
    constructor();
}
