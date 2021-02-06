import { Scene, Vector2, WebGLRenderTarget } from 'three';
import { Effect } from './Effect';
/**
 * A god rays effect.
 */
export declare class GodRaysEffect extends Effect {
    camera: any;
    lightSource: any;
    lightScene: Scene;
    screenPosition: Vector2;
    renderTargetA: WebGLRenderTarget;
    renderTargetB: any;
    renderTargetLight: any;
    renderPassLight: any;
    clearPass: any;
    blurPass: any;
    depthMaskPass: any;
    godRaysPass: any;
    /**
       * Constructs a new god rays effect.
       *
       * @param {Camera} camera - The main camera.
       * @param {Mesh|Points} lightSource - The light source. Must not write depth and has to be flagged as transparent.
       * @param {Object} [options] - The options.
       * @param {BlendFunction} [options.blendFunction=BlendFunction.SCREEN] - The blend function of this effect.
       * @param {Number} [options.samples=60.0] - The number of samples per pixel.
       * @param {Number} [options.density=0.96] - The density of the light rays.
       * @param {Number} [options.decay=0.9] - An illumination decay factor.
       * @param {Number} [options.weight=0.4] - A light ray weight factor.
       * @param {Number} [options.exposure=0.6] - A constant attenuation coefficient.
       * @param {Number} [options.clampMax=1.0] - An upper bound for the saturation of the overall effect.
       * @param {Number} [options.resolutionScale=0.5] - Deprecated. Use height or width instead.
       * @param {Number} [options.width=Resizer.AUTO_SIZE] - The render width.
       * @param {Number} [options.height=Resizer.AUTO_SIZE] - The render height.
       * @param {KernelSize} [options.kernelSize=KernelSize.SMALL] - The blur kernel size. Has no effect if blur is disabled.
       * @param {Boolean} [options.blur=true] - Whether the god rays should be blurred to reduce artifacts.
       */
    constructor(camera: any, lightSource: any, { blendFunction, samples, density, decay, weight, exposure, clampMax, resolutionScale, width, height, kernelSize, blur }?: {
        blendFunction?: number;
        samples?: number;
        density?: number;
        decay?: number;
        weight?: number;
        exposure?: number;
        clampMax?: number;
        resolutionScale?: number;
        width?: number;
        height?: number;
        kernelSize?: number;
        blur?: boolean;
    });
    /**
       * A texture that contains the intermediate result of this effect.
       *
       * This texture will be applied to the scene colors unless the blend function
       * is set to `SKIP`.
       *
       * @type {Texture}
       */
    get texture(): any;
    /**
       * The internal god rays material.
       *
       * @type {GodRaysMaterial}
       */
    get godRaysMaterial(): any;
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
       * Indicates whether the god rays should be blurred to reduce artifacts.
       *
       * @type {Boolean}
       */
    get blur(): any;
    /**
       * @type {Boolean}
       */
    set blur(value: any);
    /**
       * The blur kernel size.
       *
       * @type {KernelSize}
       * @deprecated Use blurPass.kernelSize instead.
       */
    get kernelSize(): any;
    /**
       * Sets the blur kernel size.
       *
       * @type {KernelSize}
       * @deprecated Use blurPass.kernelSize instead.
       */
    set kernelSize(value: any);
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
       * The number of samples per pixel.
       *
       * @type {Number}
       */
    get samples(): any;
    /**
       * A higher sample count improves quality at the cost of performance.
       *
       * @type {Number}
       */
    set samples(value: any);
    /**
       * Sets the depth texture.
       *
       * @param {Texture} depthTexture - A depth texture.
       * @param {Number} [depthPacking=0] - The depth packing.
       */
    setDepthTexture(depthTexture: any, depthPacking?: number): void;
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
