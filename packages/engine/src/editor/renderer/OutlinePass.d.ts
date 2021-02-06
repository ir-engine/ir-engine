import { ShaderMaterial, Vector2, Matrix4, Color, MeshBasicMaterial, WebGLRenderTarget, MeshDepthMaterial, OrthographicCamera, Scene, Mesh, Layers } from 'three';
import { Pass } from 'three/examples/jsm/postprocessing/Pass';
/**
 * Adapted from THREE.OutlinePass
 * Original author spidersharma / http://eduperiment.com/
 */
declare class DepthMaskMaterial extends ShaderMaterial {
    constructor(camera: any);
}
declare class EdgeDetectionMaterial extends ShaderMaterial {
    constructor();
}
declare class OverlayMaterial extends ShaderMaterial {
    constructor();
}
export default class OutlinePass extends Pass {
    renderScene: any;
    renderCamera: any;
    selectedObjects: any;
    editorRenderer: any;
    selectedRenderables: any[];
    nonSelectedRenderables: any[];
    edgeColor: Color;
    resolution: Vector2;
    maskBufferMaterial: MeshBasicMaterial;
    renderTargetMaskBuffer: WebGLRenderTarget;
    depthMaterial: MeshDepthMaterial;
    depthMaskMaterial: DepthMaskMaterial;
    renderTargetDepthBuffer: WebGLRenderTarget;
    edgeDetectionMaterial: EdgeDetectionMaterial;
    renderTargetEdgeBuffer: WebGLRenderTarget;
    overlayMaterial: OverlayMaterial;
    copyUniforms: any;
    copyMaterial: ShaderMaterial;
    enabled: boolean;
    needsSwap: boolean;
    oldClearColor: Color;
    oldClearAlpha: number;
    outlineCamera: OrthographicCamera;
    outlineScene: Scene;
    quad: Mesh;
    textureMatrix: Matrix4;
    renderableLayers: Layers;
    renderToScreen: any;
    constructor(resolution: any, scene: any, camera: any, selectedObjects: any, editorRenderer: any);
    render(renderer: any, writeBuffer: any, readBuffer: any, delta: any, maskActive: any): void;
}
export {};
