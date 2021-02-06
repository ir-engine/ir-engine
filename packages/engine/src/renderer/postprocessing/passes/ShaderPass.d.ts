import { Pass } from './Pass';
/**
 * A shader pass.
 *
 * Renders any shader material as a fullscreen effect.
 *
 * This pass should not be used to create multiple chained effects. For a more
 * efficient solution, please refer to the {@link EffectPass}.
 */
export declare class ShaderPass extends Pass {
    uniform: any;
    /**
       * Constructs a new shader pass.
       *
       * @param {ShaderMaterial} material - A shader material.
       * @param {String} [input="inputBuffer"] - The name of the input buffer uniform.
       */
    constructor(material: any, input?: string);
    /**
       * Sets the name of the input buffer uniform.
       *
       * Most fullscreen materials modify texels from an input texture. This pass
       * automatically assigns the main input buffer to the uniform identified by
       * the given name.
       *
       * @param {String} input - The name of the input buffer uniform.
       */
    setInput(input: any): void;
    /**
       * Renders the effect.
       *
       * @param {WebGLRenderer} renderer - The renderer.
       * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
       * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
       * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
       * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
       */
    render(renderer: any, inputBuffer: any, outputBuffer: any, deltaTime?: any, stencilTest?: any): void;
}
