import { Layers } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
/**
 * @author mrdoob / http://mrdoob.com/
 */
declare class RenderMode {
    name: string;
    renderer: any;
    editor: any;
    passes: any[];
    enableShadows: boolean;
    constructor(renderer: any, editor: any);
    render(dt?: any): void;
}
declare class UnlitRenderMode extends RenderMode {
    effectComposer: EffectComposer;
    renderPass: RenderPass;
    renderHelpersPass: RenderPass;
    outlinePass: any;
    enabledBatchedObjectLayers: Layers;
    disabledBatchedObjectLayers: Layers;
    hiddenLayers: Layers;
    disableBatching: boolean;
    editorRenderer: any;
    constructor(renderer: any, editor: any, editorRenderer: any);
    onSceneSet(): void;
    onResize(): void;
    render(dt: any): void;
}
declare class LitRenderMode extends UnlitRenderMode {
    constructor(renderer: any, editor: any, editorRenderer: any);
}
declare class ShadowsRenderMode extends UnlitRenderMode {
    constructor(renderer: any, editor: any, editorRenderer: any);
}
export default class Renderer {
    editor: any;
    canvas: any;
    renderer: any;
    renderMode: LitRenderMode;
    shadowsRenderMode: ShadowsRenderMode;
    renderModes: any[];
    screenshotRenderer: any;
    camera: any;
    onUpdateStats: any;
    constructor(editor: any, canvas: any);
    update(dt: any, _time: any): void;
    setRenderMode(mode: any): void;
    onSceneSet: () => void;
    addBatchedObject(object: any): void;
    removeBatchedObject(object: any): void;
    onResize: () => void;
    takeScreenshot: (width?: number, height?: number) => Promise<any>;
    dispose(): void;
}
export {};
