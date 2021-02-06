import { Line, Object3D, BufferGeometry, LineBasicMaterial } from "three";
export default class DirectionalPlaneHelper extends Object3D {
    plane: Line<BufferGeometry, LineBasicMaterial>;
    directionLine: Line<BufferGeometry, LineBasicMaterial>;
    constructor(size?: number);
    setColor(color: any): void;
    dispose(): void;
}
