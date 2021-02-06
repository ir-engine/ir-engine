import { Pass } from './Pass';
/**
 * A pass that renders the result from a previous pass to another render target.
 */
export declare class SavePass extends Pass {
    renderTarget: any;
    resize: boolean;
    /**
       * Constructs a new save pass.
       *
       * @param {WebGLRenderTarget} [renderTarget] - A render target.
       * @param {Boolean} [resize=true] - Whether the render target should adjust to the size of the input buffer.
       */
    constructor(renderTarget: any, resize?: boolean);
    /**
       * Saves the input buffer.
       *
       * @param {WebGLRenderer} renderer - The renderer.
       * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
       * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
       * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
       * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
       */
    render(renderer: any, inputBuffer: any, outputBuffer?: any, deltaTime?: any, stencilTest?: any): void;
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
       * @param {WebGLRenderer} renderer - A renderer.
       * @param {Boolean} alpha - Whether the renderer uses the alpha channel.
       * @param {Number} frameBufferType - The type of the main frame buffers.
       */
    initialize(renderer: any, alpha: any, frameBufferType: any): void;
}
