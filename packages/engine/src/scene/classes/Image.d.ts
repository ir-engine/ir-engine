import { Object3D, Mesh } from "three";
export declare const ImageProjection: {
    Flat: string;
    Equirectangular360: string;
};
export declare const ImageAlphaMode: {
    Opaque: string;
    Blend: string;
    Mask: string;
};
export default class Image extends Object3D {
    _src: any;
    _projection: string;
    _alphaMode: string;
    _alphaCutoff: number;
    _mesh: Mesh;
    _texture: any;
    constructor();
    get src(): any;
    set src(src: any);
    loadTexture(src: any): Promise<unknown>;
    get alphaMode(): string;
    set alphaMode(v: string);
    get alphaCutoff(): number;
    set alphaCutoff(v: number);
    get projection(): string;
    set projection(projection: string);
    load(src: any): Promise<this>;
    onResize(): void;
    copy(source: any, recursive?: boolean): this;
}
