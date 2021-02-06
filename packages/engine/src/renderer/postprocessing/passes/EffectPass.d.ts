import { Effect } from '../Effect';
import { Pass } from './Pass';
import { Camera, WebGLRenderer, WebGLRenderTarget } from 'three';
/**
 * An effect pass.
 *
 * Use this pass to combine {@link Effect} instances.
 *
 * @implements {EventListener}
 */
export declare class EffectPass extends Pass {
    effects: Effect[];
    skipRendering: boolean;
    uniforms: number;
    varyings: number;
    minTime: number;
    maxTime: number;
    needsDepthTexture: boolean;
    needsSwap: boolean;
    needsUpdate: boolean;
    capabilities: any;
    /**
       * Constructs a new effect pass.
       *
       * The provided effects will be organized and merged for optimal performance.
       *
       * @param {Camera} camera - The main camera. The camera's type and settings will be available to all effects.
       * @param {...Effect} effects - The effects that will be rendered by this pass.
       */
    constructor(camera: Camera, ...effects: any[]);
    /**
       * Indicates whether this pass encodes its output when rendering to screen.
       *
       * @type {Boolean}
       */
    get encodeOutput(): boolean;
    /**
       * Enables or disables output encoding.
       *
       * @type {Boolean}
       */
    set encodeOutput(value: boolean);
    /**
       * Indicates whether dithering is enabled.
       *
       * Color quantization reduces banding artifacts but degrades performance.
       *
       * @type {Boolean}
       */
    get dithering(): any;
    /**
       * Enables or disables dithering.
       *
       * @type {Boolean}
       */
    set dithering(value: any);
    /**
       * Compares required resources with device capabilities.
       *
       * @private
       * @param {WebGLRenderer} renderer - The renderer.
       */
    verifyResources(renderer: WebGLRenderer): void;
    /**
       * Updates the compound shader material.
       *
       * @private
       */
    updateMaterial(): void;
    /**
       * Updates the shader material.
       *
       * Warning: This method triggers a relatively expensive shader recompilation.
       *
       * @param {WebGLRenderer} [renderer] - The renderer.
       */
    recompile(renderer: any): void;
    /**
       * Returns the current depth texture.
       *
       * @return {Texture} The current depth texture, or null if there is none.
       */
    getDepthTexture(): any;
    /**
       * Sets the depth texture.
       *
       * @param {Texture} depthTexture - A depth texture.
       * @param {Number} [depthPacking=0] - The depth packing.
       */
    setDepthTexture(depthTexture: any, depthPacking?: number): void;
    /**
       * Renders the effect.
       *
       * @param {WebGLRenderer} renderer - The renderer.
       * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
       * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
       * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
       * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
       */
    render(renderer: WebGLRenderer, inputBuffer: WebGLRenderTarget, outputBuffer: WebGLRenderTarget, deltaTime: number, stencilTest: boolean): void;
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
    /**
       * Deletes disposable objects.
       *
       * This pass will be inoperative after this method was called!
       */
    dispose(): void;
    /**
       * Handles events.
       *
       * @param {Event} event - An event.
       */
    handleEvent(event: any): void;
}
