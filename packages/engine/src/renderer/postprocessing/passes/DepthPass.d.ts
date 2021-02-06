import { Resizer } from '../core/Resizer';
import { Pass } from './Pass';
import { RenderPass } from './RenderPass';
/**
 * A pass that renders the depth of a given scene into a color buffer.
 */
export declare class DepthPass extends Pass {
    needsSwap: boolean;
    renderPass: RenderPass;
    renderTarget: any;
    resolution: Resizer;
    resolutionScale: any;
    /**
       * Constructs a new depth pass.
       *
       * @param {Scene} scene - The scene to render.
       * @param {Camera} camera - The camera to use to render the scene.
       * @param {Object} [options] - The options.
       * @param {Number} [options.resolutionScale=1.0] - Deprecated. Adjust the height or width instead for consistent results.
       * @param {Number} [options.width=Resizer.AUTO_SIZE] - The render width.
       * @param {Number} [options.height=Resizer.AUTO_SIZE] - The render height.
       * @param {WebGLRenderTarget} [options.renderTarget] - A custom render target.
       */
    constructor(scene: any, camera: any, options?: any);
    /**
       * The depth texture.
       *
       * @type {Texture}
       */
    get texture(): any;
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
       * Renders the scene depth.
       *
       * @param {WebGLRenderer} renderer - The renderer.
       * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
       * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
       * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
       * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
       */
    render(renderer: any, inputBuffer?: any, outputBuffer?: any, deltaTime?: any, stencilTest?: any): void;
    /**
       * Updates the size of this pass.
       *
       * @param {Number} width - The width.
       * @param {Number} height - The height.
       */
    setSize(width: any, height: any): void;
}
