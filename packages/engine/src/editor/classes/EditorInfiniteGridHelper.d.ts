import { Mesh, Plane, Vector3 } from "three";
export default class EditorInfiniteGridHelper extends Mesh {
    plane: Plane;
    intersectionPointWorld: Vector3;
    intersection: any;
    constructor(size1?: any, size2?: any, color?: any, distance?: any);
    setSize(size: any): void;
    raycast(raycaster: any, intersects: any): any;
}
