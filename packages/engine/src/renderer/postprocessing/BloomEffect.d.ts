import { WebGLRenderTarget } from 'three';
import { Effect } from './Effect';
/**
 * A bloom effect.
 *
 * This effect uses the fast Kawase convolution technique and a luminance filter
 * to blur bright highlights.
 */
export declare class BloomEffect extends Effect {
    renderTarget: WebGLRenderTarget;
    uniforms: any;
    blurPass: any;
    luminancePass: any;
    /**
       * Constructs a new bloom effect.
       *
       * @param {Object} [options] - The options.
       * @param {BlendFunction} [options.blendFunction=BlendFunction.SCREEN] - The blend function of this effect.
       * @param {Number} [options.luminanceThreshold=0.9] - The luminance threshold. Raise this value to mask out darker elements in the scene. Range is [0, 1].
       * @param {Number} [options.luminanceSmoothing=0.025] - Controls the smoothness of the luminance threshold. Range is [0, 1].
       * @param {Number} [options.resolutionScale=0.5] - Deprecated. Use height or width instead.
       * @param {Number} [options.intensity=1.0] - The intensity.
       * @param {Number} [options.width=Resizer.AUTO_SIZE] - The render width.
       * @param {Number} [options.height=Resizer.AUTO_SIZE] - The render height.
       * @param {KernelSize} [options.kernelSize=KernelSize.LARGE] - The blur kernel size.
       */
    constructor({ blendFunction, luminanceThreshold, luminanceSmoothing, resolutionScale, intensity, width, height, kernelSize }?: {
        blendFunction?: number;
        luminanceThreshold?: number;
        luminanceSmoothing?: number;
        resolutionScale?: number;
        intensity?: number;
        width?: number;
        height?: number;
        kernelSize?: number;
    });
    /**
       * A texture that contains the intermediate result of this effect.
       *
       * This texture will be applied to the scene colors unless the blend function
       * is set to `SKIP`.
       *
       * @type {Texture}
       */
    get texture(): import("three").Texture;
    /**
       * The luminance material.
       *
       * @type {LuminanceMaterial}
       */
    get luminanceMaterial(): any;
    /**
       * The resolution of this effect.
       *
       * @type {Resizer}
       */
    get resolution(): any;
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
       * Indicates whether dithering is enabled.
       *
       * @type {Boolean}
       * @deprecated Set the frameBufferType of the EffectComposer to HalfFloatType instead.
       */
    get dithering(): any;
    /**
       * Enables or disables dithering.
       *
       * @type {Boolean}
       * @deprecated Set the frameBufferType of the EffectComposer to HalfFloatType instead.
       */
    set dithering(value: any);
    /**
       * The blur kernel size.
       *
       * @type {KernelSize}
       * @deprecated Use blurPass.kernelSize instead.
       */
    get kernelSize(): any;
    /**
       * @type {KernelSize}
       * @deprecated Use blurPass.kernelSize instead.
       */
    set kernelSize(value: any);
    /**
       * @type {Number}
       * @deprecated Use luminanceMaterial.threshold and luminanceMaterial.smoothing instead.
       */
    get distinction(): number;
    /**
       * @type {Number}
       * @deprecated Use luminanceMaterial.threshold and luminanceMaterial.smoothing instead.
       */
    set distinction(value: number);
    /**
       * The bloom intensity.
       *
       * @type {Number}
       */
    get intensity(): any;
    /**
       * Sets the bloom intensity.
       *
       * @type {Number}
       */
    set intensity(value: any);
    /**
       * Returns the current resolution scale.
       *
       * @return {Number} The resolution scale.
       * @deprecated Adjust the fixed resolution width or height instead.
       */
    getResolutionScale(): any;
    /**
       * Sets the resolution scale.
       *
       * @param {Number} scale - The new resolution scale.
       * @deprecated Adjust the fixed resolution width or height instead.
       */
    setResolutionScale(scale: any): void;
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
