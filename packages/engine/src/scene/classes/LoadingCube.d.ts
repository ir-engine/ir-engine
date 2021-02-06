import { Object3D, AnimationMixer, Vector3 } from "three";
export default class LoadingCube extends Object3D {
    model: any;
    mixer: AnimationMixer;
    worldScale: Vector3;
    static load(): Promise<{
        scene: any;
        json: any;
        stats: any;
    }>;
    constructor();
    copy(source: any, recursive?: boolean): this;
    update(dt: any): void;
}
