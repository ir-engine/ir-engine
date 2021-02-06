import { Object3D } from "three";
export default class FloorPlan extends Object3D {
    navMesh: any;
    trimesh: any;
    heightfield: any;
    heightfieldMesh: any;
    constructor();
    setNavMesh(object: any): void;
    setTrimesh(object: any): void;
    setHeightfield(heightfield: any): void;
    copy(source: any, recursive?: boolean): this;
}
