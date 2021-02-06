import { Object3D } from "three";
export default class Model extends Object3D {
    model: any;
    _src: any;
    _castShadow: boolean;
    _receiveShadow: boolean;
    activeClipIndex: number;
    animationMixer: any;
    activeClipAction: any;
    constructor();
    get src(): any;
    set src(value: any);
    loadGLTF(src: any): Promise<any>;
    load(src: any, ...args: any[]): Promise<this>;
    getClipOptions(): any;
    get activeClip(): any;
    updateAnimationState(): void;
    playAnimation(): void;
    stopAnimation(): void;
    update(dt: any): void;
    /** @ts-ignore */
    get castShadow(): boolean;
    set castShadow(value: boolean);
    /** @ts-ignore */
    get receiveShadow(): boolean;
    set receiveShadow(value: boolean);
    setShadowsEnabled(enabled: any): void;
    copy(source: any, recursive?: boolean): this;
}
