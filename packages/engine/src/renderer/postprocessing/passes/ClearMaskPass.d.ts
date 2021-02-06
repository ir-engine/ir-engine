import { Pass } from './Pass';
/**
 * A pass that disables the stencil test.
 */
export declare class ClearMaskPass extends Pass {
    needsSwap: boolean;
    /**
       * Constructs a new clear mask pass.
       */
    constructor();
    /**
       * Disables the global stencil test.
       *
       * @param {WebGLRenderer} renderer - The renderer.
       * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
       * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
       * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
       * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
       */
    render(renderer: any, inputBuffer: any, outputBuffer: any, deltaTime: any, stencilTest: any): void;
}
