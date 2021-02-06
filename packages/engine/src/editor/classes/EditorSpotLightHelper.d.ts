import { Object3D, LineSegments } from "three";
export default class EditorSpotLightHelper extends Object3D {
    light: any;
    color: any;
    outerCone: LineSegments;
    innerCone: LineSegments;
    constructor(light: any, color?: any);
    dispose(): void;
    update: () => void;
}
