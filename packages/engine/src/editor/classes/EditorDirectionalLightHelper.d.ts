import { Line, Object3D, BufferGeometry, LineBasicMaterial } from "three";
export default class EditorDirectionalLightHelper extends Object3D {
    light: any;
    color: any;
    lightPlane: Line<BufferGeometry, LineBasicMaterial>;
    targetLine: Line<BufferGeometry, LineBasicMaterial>;
    constructor(light: any, size?: any, color?: any);
    update(): void;
    dispose(): void;
}
