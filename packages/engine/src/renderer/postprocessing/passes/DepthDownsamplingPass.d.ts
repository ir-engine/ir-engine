import { WebGLRenderTarget } from 'three';
import { Resizer } from '../core/Resizer';
import { Pass } from './Pass';
/**
 * A pass that downsamples the scene depth by picking the most representative
 * depth in 2x2 texel neighborhoods. If a normal buffer is provided, the
 * corresponding normals will be stored as well.
 *
 * Attention: This pass requires WebGL 2.
 */
export declare class DepthDownsamplingPass extends Pass {
    needsDepthTexture: boolean;
    needsSwap: boolean;
    renderTarget: WebGLRenderTarget;
    resolution: Resizer;
    /**
       * Constructs a new depth downsampling pass.
       *
       * @param {Object} [options] - The options.
       * @param {Texture} [options.normalBuffer=null] - A texture that contains view space normals. See {@link NormalPass}.
       * @param {Number} [options.resolutionScale=0.5] - The resolution scale.
       * @param {Number} [options.width=Resizer.AUTO_SIZE] - The render width.
       * @param {Number} [options.height=Resizer.AUTO_SIZE] - The render height.
       */
    constructor({ normalBuffer, resolutionScale, width, height }?: {
        normalBuffer?: any;
        resolutionScale?: number;
        width?: number;
        height?: number;
    });
    /**
       * The normal(RGB) + depth(A) texture.
       *
       * @type {Texture}
       */
    get texture(): import("three").Texture;
    /**
       * Sets the depth texture.
       *
       * @param {Texture} depthTexture - A depth texture.
       * @param {Number} [depthPacking=0] - The depth packing.
       */
    setDepthTexture(depthTexture: any, depthPacking?: number): void;
    /**
       * Downsamples depth and scene normals.
       *
       * @param {WebGLRenderer} renderer - The renderer.
       * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
       * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
       * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
       * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
       */
    render(renderer: any, inputBuffer: any, outputBuffer: any, deltaTime: any, stencilTest: any): void;
    /**
       * Updates the size of this pass.
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
