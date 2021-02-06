import { ClearPass } from './ClearPass';
import { Pass } from './Pass';
/**
 * A stencil mask pass.
 *
 * This pass requires that the input and output buffers have a stencil buffer.
 * You can enable the stencil buffer via the {@link EffectComposer} constructor.
 */
export declare class MaskPass extends Pass {
    needsSwap: boolean;
    clearPass: ClearPass;
    inverse: boolean;
    scene: any;
    camera: any;
    /**
       * Constructs a new mask pass.
       *
       * @param {Scene} scene - The scene to render.
       * @param {Camera} camera - The camera to use.
       */
    constructor(scene: any, camera: any);
    /**
       * Indicates whether this pass should clear the stencil buffer.
       *
       * @type {Boolean}
       */
    get clear(): any;
    /**
       * Enables or disables auto clear.
       *
       * @type {Boolean}
       */
    set clear(value: any);
    /**
       * Renders the effect.
       *
       * @param {WebGLRenderer} renderer - The renderer.
       * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
       * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
       * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
       * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
       */
    render(renderer: any, inputBuffer: any, outputBuffer: any, deltaTime: any, stencilTest: any): void;
}
