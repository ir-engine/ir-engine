import { Mesh } from "three";
export default class EditorPointLightHelper extends Mesh {
    light: any;
    lightDistanceHelper: Mesh;
    constructor(light: any, sphereSize?: any);
    dispose(): void;
    update(): void;
}
