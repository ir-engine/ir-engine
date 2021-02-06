import { WebGLRenderTarget } from 'three';
import { Resizer } from './core/Resizer';
import { BlurPass } from './passes/BlurPass';
import { Effect } from './Effect';
import { DepthPass } from './passes/DepthPass';
import { ClearPass } from './passes/ClearPass';
import { RenderPass } from './passes/RenderPass';
import { Selection } from './core/Selection';
/**
 * An outline effect.
 */
export declare class OutlineEffect extends Effect {
    scene: any;
    camera: any;
    renderTargetMask: WebGLRenderTarget;
    renderTargetOutline: any;
    renderTargetBlurredOutline: any;
    clearPass: ClearPass;
    depthPass: DepthPass;
    maskPass: RenderPass;
    blurPass: BlurPass;
    outlinePass: any;
    time: number;
    selection: Selection;
    pulseSpeed: number;
    /**
       * Constructs a new outline effect.
       *
       * If you want dark outlines, remember to use an appropriate blend function.
       *
       * @param {Scene} scene - The main scene.
       * @param {Camera} camera - The main camera.
       * @param {Object} [options] - The options.
       * @param {BlendFunction} [options.blendFunction=BlendFunction.SCREEN] - The blend function.  Set this to `BlendFunction.ALPHA` for dark outlines.
       * @param {Number} [options.patternTexture=null] - A pattern texture.
       * @param {Number} [options.edgeStrength=1.0] - The edge strength.
       * @param {Number} [options.pulseSpeed=0.0] - The pulse speed. A value of zero disables the pulse effect.
       * @param {Number} [options.visibleEdgeColor=0xffffff] - The color of visible edges.
       * @param {Number} [options.hiddenEdgeColor=0x22090a] - The color of hidden edges.
       * @param {Number} [options.resolutionScale=0.5] - Deprecated. Use height or width instead.
       * @param {Number} [options.width=Resizer.AUTO_SIZE] - The render width.
       * @param {Number} [options.height=Resizer.AUTO_SIZE] - The render height.
       * @param {KernelSize} [options.kernelSize=KernelSize.VERY_SMALL] - The blur kernel size.
       * @param {Boolean} [options.blur=false] - Whether the outline should be blurred.
       * @param {Boolean} [options.xRay=true] - Whether occluded parts of selected objects should be visible.
       */
    constructor(scene: any, camera: any, { blendFunction, patternTexture, edgeStrength, pulseSpeed, visibleEdgeColor, hiddenEdgeColor, resolutionScale, width, height, kernelSize, blur, xRay }: {
        blendFunction?: number;
        patternTexture?: any;
        edgeStrength?: number;
        pulseSpeed?: number;
        visibleEdgeColor?: number;
        hiddenEdgeColor?: number;
        resolutionScale?: number;
        width?: number;
        height?: number;
        kernelSize?: number;
        blur?: boolean;
        xRay?: boolean;
    });
    /**
       * The resolution of this effect.
       *
       * @type {Resizer}
       */
    get resolution(): Resizer;
    /**
       * The current width of the internal render targets.
       *
       * @type {Number}
       * @deprecated Use resolution.width instead.
       */
    get width(): any;
    /**
       * Sets the render width.
       *
       * @type {Number}
       * @deprecated Use resolution.width instead.
       */
    set width(value: any);
    /**
       * The current height of the internal render targets.
       *
       * @type {Number}
       * @deprecated Use resolution.height instead.
       */
    get height(): any;
    /**
       * Sets the render height.
       *
       * @type {Number}
       * @deprecated Use resolution.height instead.
       */
    set height(value: any);
    /**
       * @type {Number}
       * @deprecated Use selection.layer instead.
       */
    get selectionLayer(): number;
    /**
       * @type {Number}
       * @deprecated Use selection.layer instead.
       */
    set selectionLayer(value: number);
    /**
       * Indicates whether dithering is enabled.
       *
       * @type {Boolean}
       * @deprecated Set the frameBufferType of the EffectComposer to HalfFloatType instead.
       */
    get dithering(): boolean;
    /**
       * Enables or disables dithering.
       *
       * @type {Boolean}
       * @deprecated Set the frameBufferType of the EffectComposer to HalfFloatType instead.
       */
    set dithering(value: boolean);
    /**
       * The blur kernel size.
       *
       * @type {KernelSize}
       * @deprecated Use blurPass.kernelSize instead.
       */
    get kernelSize(): any;
    /**
       * Sets the kernel size.
       *
       * @type {KernelSize}
       * @deprecated Use blurPass.kernelSize instead.
       */
    set kernelSize(value: any);
    /**
       * Indicates whether the outlines should be blurred.
       *
       * @type {Boolean}
       */
    get blur(): boolean;
    /**
       * @type {Boolean}
       */
    set blur(value: boolean);
    /**
       * Indicates whether X-Ray outlines are enabled.
       *
       * @type {Boolean}
       */
    get xRay(): boolean;
    /**
       * Enables or disables X-Ray outlines.
       *
       * @type {Boolean}
       */
    set xRay(value: boolean);
    /**
       * Sets the pattern texture.
       *
       * @param {Texture} texture - The new texture.
       */
    setPatternTexture(texture: any): void;
    /**
       * Returns the current resolution scale.
       *
       * @return {Number} The resolution scale.
       * @deprecated Adjust the fixed resolution width or height instead.
       */
    getResolutionScale(): number;
    /**
       * Sets the resolution scale.
       *
       * @param {Number} scale - The new resolution scale.
       * @deprecated Adjust the fixed resolution width or height instead.
       */
    setResolutionScale(scale: any): void;
    /**
       * Clears the current selection and selects a list of objects.
       *
       * @param {Object3D[]} objects - The objects that should be outlined. This array will be copied.
       * @return {OutlinePass} This pass.
       * @deprecated Use selection.set instead.
       */
    setSelection(objects: any): this;
    /**
       * Clears the list of selected objects.
       *
       * @return {OutlinePass} This pass.
       * @deprecated Use selection.clear instead.
       */
    clearSelection(): this;
    /**
       * Selects an object.
       *
       * @param {Object3D} object - The object that should be outlined.
       * @return {OutlinePass} This pass.
       * @deprecated Use selection.add instead.
       */
    selectObject(object: any): this;
    /**
       * Deselects an object.
       *
       * @param {Object3D} object - The object that should no longer be outlined.
       * @return {OutlinePass} This pass.
       * @deprecated Use selection.delete instead.
       */
    deselectObject(object: any): this;
    /**
       * Updates this effect.
       *
       * @param {WebGLRenderer} renderer - The renderer.
       * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
       * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
       */
    update(renderer: any, inputBuffer: any, deltaTime: any): void;
    /**
       * Updates the size of internal render targets.
       *
       * @param {Number} width - The width.
       * @param {Number} height - The height.
       */
    setSize(width: any, height: any): void;
    /**
       * Performs initialization tasks.
       *
       * @param {WebGLRenderer} renderer - The renderer.
       * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
       * @param {Number} frameBufferType - The type of the main frame buffers.
       */
    initialize(renderer: any, alpha: any, frameBufferType: any): void;
}
