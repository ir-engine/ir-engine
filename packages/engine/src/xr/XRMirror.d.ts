import { Matrix4, Mesh, PerspectiveCamera, Plane, ShaderMaterial, Vector3, Vector4, WebGLRenderTarget } from "three";
export declare class Mirror extends Mesh {
    options: any;
    color: any;
    textureWidth: any;
    textureHeight: any;
    clipBias: any;
    shader: any;
    recursion: any;
    onAfterRender2: any;
    mirrorPlane: Plane;
    normal: Vector3;
    mirrorWorldPosition: Vector3;
    cameraWorldPosition: Vector3;
    rotationMatrix: Matrix4;
    lookAtPosition: Vector3;
    clipPlane: Vector4;
    material: ShaderMaterial;
    view: Vector3;
    target: Vector3;
    q: Vector4;
    parameters: {
        minFilter: import("three").TextureFilter;
        magFilter: import("three").TextureFilter;
        format: import("three").PixelFormat;
        stencilBuffer: boolean;
    };
    renderTarget: WebGLRenderTarget;
    textureMatrix: Matrix4;
    virtualCamera: PerspectiveCamera;
    static MirrorShader: any;
    constructor({ options }: {
        options: any;
    });
    onBeforeRender: (renderer: any, scene: any, camera: any) => void;
    onAfterRender: (renderer: any, scene: any, camera: any) => void;
    getRenderTarget: () => any;
}
