import { Pass } from './Pass';
/**
 * A pass that clears the input buffer or the screen.
 */
export declare class ClearPass extends Pass {
    needsSwap: boolean;
    color: boolean;
    depth: boolean;
    stencil: boolean;
    overrideClearColor: any;
    overrideClearAlpha: number;
    /**
       * Constructs a new clear pass.
       *
       * @param {Boolean} [color=true] - Determines whether the color buffer should be cleared.
       * @param {Boolean} [depth=true] - Determines whether the depth buffer should be cleared.
       * @param {Boolean} [stencil=false] - Determines whether the stencil buffer should be cleared.
       */
    constructor(color?: boolean, depth?: boolean, stencil?: boolean);
    /**
       * Clears the input buffer or the screen.
       *
       * @param {WebGLRenderer} renderer - The renderer.
       * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
       * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
       * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
       * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
       */
    render(renderer: any, inputBuffer: any, outputBuffer?: any, deltaTime?: any, stencilTest?: any): void;
}
