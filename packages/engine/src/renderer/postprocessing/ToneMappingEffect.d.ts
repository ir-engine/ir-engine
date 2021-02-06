import { WebGLRenderTarget } from 'three';
import { SavePass } from './passes/SavePass';
import { ShaderPass } from './passes/ShaderPass';
import { Effect } from './Effect';
/**
 * A tone mapping effect that supports adaptive luminosity.
 *
 * If adaptivity is enabled, this effect generates a texture that represents the
 * luminosity of the current scene and adjusts it over time to simulate the
 * optic nerve responding to the amount of light it is receiving.
 *
 * Reference:
 *  GDC2007 - Wolfgang Engel, Post-Processing Pipeline
 *  http://perso.univ-lyon1.fr/jean-claude.iehl/Public/educ/GAMA/2007/gdc07/Post-Processing_Pipeline.pdf
 */
export declare class ToneMappingEffect extends Effect {
    renderTargetLuminance: WebGLRenderTarget;
    renderTargetAdapted: any;
    renderTargetPrevious: any;
    savePass: SavePass;
    luminancePass: ShaderPass;
    adaptiveLuminancePass: ShaderPass;
    /**
       * Constructs a new tone mapping effect.
       *
       * @param {Object} [options] - The options.
       * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
       * @param {Boolean} [options.adaptive=true] - Whether the tone mapping should use an adaptive luminance map.
       * @param {Number} [options.resolution=256] - The render texture resolution of the luminance map.
       * @param {Number} [options.middleGrey=0.6] - The middle grey factor.
       * @param {Number} [options.maxLuminance=16.0] - The maximum luminance.
       * @param {Number} [options.averageLuminance=1.0] - The average luminance.
       * @param {Number} [options.adaptationRate=1.0] - The luminance adaptation rate.
       */
    constructor({ blendFunction, adaptive, resolution, middleGrey, maxLuminance, averageLuminance, adaptationRate }?: {
        blendFunction?: number;
        adaptive?: boolean;
        resolution?: number;
        middleGrey?: number;
        maxLuminance?: number;
        averageLuminance?: number;
        adaptationRate?: number;
    });
    /**
       * The resolution of the render targets.
       *
       * @type {Number}
       */
    get resolution(): number;
    /**
       * Sets the resolution of the internal render targets.
       *
       * @type {Number}
       */
    set resolution(value: number);
    /**
       * Indicates whether this pass uses adaptive luminance.
       *
       * @type {Boolean}
       */
    get adaptive(): boolean;
    /**
       * Enables or disables adaptive luminance.
       *
       * @type {Boolean}
       */
    set adaptive(value: boolean);
    /**
       * The luminance adaptation rate.
       *
       * @type {Number}
       */
    get adaptationRate(): any;
    /**
       * @type {Number}
       */
    set adaptationRate(value: any);
    /**
       * @type {Number}
       * @deprecated
       */
    get distinction(): number;
    /**
       * @type {Number}
       * @deprecated
       */
    set distinction(value: number);
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
