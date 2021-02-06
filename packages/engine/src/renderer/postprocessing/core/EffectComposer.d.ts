import { DepthTexture, WebGLRenderer } from 'three';
import { ShaderPass } from '../passes/ShaderPass';
import { OutlineEffect } from '../OutlineEffect';
export declare class EffectComposer {
    renderer: any;
    inputBuffer: any;
    outputBuffer: any;
    copyPass: ShaderPass;
    outlineEffect: OutlineEffect;
    depthTexture: any;
    passes: any[];
    autoRenderToScreen: boolean;
    /**
       * Constructs a new effect composer.
       *
       * @param {WebGLRenderer} renderer - The renderer that should be used.
       * @param {Object} [options] - The options.
       * @param {Boolean} [options.depthBuffer=true] - Whether the main render targets should have a depth buffer.
       * @param {Boolean} [options.stencilBuffer=false] - Whether the main render targets should have a stencil buffer.
       * @param {Number} [options.multisampling=0] - The number of samples used for multisample antialiasing. Requires WebGL 2.
       * @param {Boolean} [options.frameBufferType] - The type of the internal frame buffers. It's recommended to use HalfFloatType if possible.
       */
    constructor(renderer: WebGLRenderer, options?: {
        depthBuffer: boolean;
        stencilBuffer: boolean;
        multisampling: boolean;
        frameBufferType: import("three").TextureDataType;
    });
    /**
       * The current amount of samples used for multisample antialiasing.
       *
       * @type {Number}
       */
    get multisampling(): number;
    /**
       * Sets the amount of MSAA samples.
       *
       * Requires WebGL 2. Set to zero to disable multisampling.
       *
       * @type {Number}
       */
    set multisampling(value: number);
    /**
       * Returns the WebGL renderer.
       *
       * You may replace the renderer at any time by using
       * {@link EffectComposer#replaceRenderer}.
       *
       * @return {WebGLRenderer} The renderer.
       */
    getRenderer(): any;
    /**
       * Explicitly enables required WebGL extensions.
       *
       * @private
       */
    enableExtensions(): void;
    /**
       * Replaces the current renderer with the given one.
       *
       * The auto clear mechanism of the provided renderer will be disabled. If the
       * new render size differs from the previous one, all passes will be updated.
       *
       * By default, the DOM element of the current renderer will automatically be
       * removed from its parent node and the DOM element of the new renderer will
       * take its place.
       *
       * @param {WebGLRenderer} renderer - The new renderer.
       * @param {Boolean} updateDOM - Indicates whether the old canvas should be replaced by the new one in the DOM.
       * @return {WebGLRenderer} The old renderer.
       */
    replaceRenderer(renderer: any, updateDOM?: boolean): any;
    /**
       * Creates a depth texture attachment that will be provided to all passes.
       *
       * Note: When a shader reads from a depth texture and writes to a render
       * target that uses the same depth texture attachment, the depth information
       * will be lost. This happens even if `depthWrite` is disabled.
       *
       * @private
       * @return {DepthTexture} The depth texture.
       */
    createDepthTexture(): DepthTexture;
    /**
       * Creates a new render target by replicating the renderer's canvas.
       *
       * The created render target uses a linear filter for texel minification and
       * magnification. Its render texture format depends on whether the renderer
       * uses the alpha channel. Mipmaps are disabled.
       *
       * Note: The buffer format will also be set to RGBA if the frame buffer type
       * is HalfFloatType because RGB16F buffers are not renderable.
       *
       * @param {Boolean} depthBuffer - Whether the render target should have a depth buffer.
       * @param {Boolean} stencilBuffer - Whether the render target should have a stencil buffer.
       * @param {Number} type - The frame buffer type.
       * @param {Number} multisampling - The number of samples to use for antialiasing.
       * @return {WebGLRenderTarget} A new render target that equals the renderer's canvas.
       */
    createBuffer(depthBuffer: any, stencilBuffer: any, type: any, multisampling: any): any;
    /**
       * Adds a pass, optionally at a specific index.
       *
       * @param {Pass} pass - A new pass.
       * @param {Number} [index] - An index at which the pass should be inserted.
       */
    addPass(pass: any, index?: any): void;
    /**
       * Removes a pass.
       *
       * @param {Pass} pass - The pass.
       */
    removePass(pass: any): void;
    /**
       * Renders all enabled passes in the order in which they were added.
       *
       * @param {Number} deltaTime - The time between the last frame and the current one in seconds.
       */
    render(deltaTime: any): void;
    /**
       * Sets the size of the buffers and the renderer's output canvas.
       *
       * Every pass will be informed of the new size. It's up to each pass how that
       * information is used.
       *
       * If no width or height is specified, the render targets and passes will be
       * updated with the current size of the renderer.
       *
       * @param {Number} [width] - The width.
       * @param {Number} [height] - The height.
       * @param {Boolean} [updateStyle] - Determines whether the style of the canvas should be updated.
       */
    setSize(width: any, height: any, updateStyle?: any): void;
    /**
       * Resets this composer by deleting all passes and creating new buffers.
       */
    reset(): void;
    /**
       * Destroys this composer and all passes.
       *
       * This method deallocates all disposable objects created by the passes. It
       * also deletes the main frame buffers of this composer.
       */
    dispose(): void;
}
