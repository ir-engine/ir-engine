import { OrthographicCamera, Scene, ShaderMaterial, WebGLRenderTarget } from "three";
declare class PMREMCubeUVPacker {
    width: any;
    height: any;
    camera: OrthographicCamera;
    scene: Scene;
    shader: ShaderMaterial;
    cubeLods: any;
    CubeUVRenderTarget: WebGLRenderTarget;
    objects: any[];
    numLods: number;
    constructor(cubeTextureLods: any);
    update(renderer: any): void;
    dispose(): void;
    getShader(): ShaderMaterial;
}
export { PMREMCubeUVPacker };
