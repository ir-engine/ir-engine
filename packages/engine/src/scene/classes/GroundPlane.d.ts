import { Object3D, CircleBufferGeometry, Mesh } from "three";
export default class GroundPlane extends Object3D {
    static _geometry: CircleBufferGeometry;
    _receiveShadow: boolean;
    mesh: Mesh;
    constructor();
    get color(): import("three").Color;
    get receiveShadow(): boolean;
    set receiveShadow(value: boolean);
    copy(source: any, recursive?: boolean): this;
}
