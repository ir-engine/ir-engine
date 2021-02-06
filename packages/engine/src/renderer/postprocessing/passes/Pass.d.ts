import { Camera, Scene } from 'three';
/**
 * An abstract pass.
 *
 * Passes that do not rely on the depth buffer should explicitly disable the
 * depth test and depth write flags of their fullscreen shader material.
 *
 * Fullscreen passes use a shared fullscreen triangle:
 * https://michaldrobot.com/2014/04/01/gcn-execution-patterns-in-full-screen-passes/
 *
 * @implements {Initializable}
 * @implements {Resizable}
 * @implements {Disposable}
 */
export declare class Pass {
    name: string;
    scene: Scene;
    camera: Camera;
    screen: any;
    rtt: boolean;
    needsSwap: boolean;
    needsDepthTexture: boolean;
    enabled: boolean;
    /**
       * Constructs a new pass.
       *
       * @param {String} [name] - The name of this pass. Does not have to be unique.
       * @param {Scene} [scene] - The scene to render. The default scene contains a single mesh that fills the screen.
       * @param {Camera} [camera] - A camera. Fullscreen effect passes don't require a camera.
       */
    constructor(name?: string, scene?: Scene, camera?: Camera);
    /**
       * Indicates whether this pass should render to screen.
       *
       * @type {Boolean}
       */
    get renderToScreen(): boolean;
    /**
       * Sets the render to screen flag.
       *
       * If the flag is changed to a different value, the fullscreen material will
       * be updated as well.
       *
       * @type {Boolean}
       */
    set renderToScreen(value: boolean);
    /**
       * Returns the current fullscreen material.
       *
       * @return {Material} The current fullscreen material, or null if there is none.
       */
    getFullscreenMaterial(): any;
    /**
       * Sets the fullscreen material.
       *
       * The material will be assigned to a mesh that fills the screen. The mesh
       * will be created once a material is assigned via this method.
       *
       * @protected
       * @param {Material} material - A fullscreen material.
       */
    setFullscreenMaterial(material: any): void;
    /**
       * Returns the current depth texture.
       *
       * @return {Texture} The current depth texture, or null if there is none.
       */
    getDepthTexture(): any;
    /**
       * Sets the depth texture.
       *
       * This method will be called automatically by the {@link EffectComposer}.
       *
       * You may override this method if your pass relies on the depth information
       * of a preceding {@link RenderPass}.
       *
       * @param {Texture} depthTexture - A depth texture.
       * @param {Number} [depthPacking=0] - The depth packing.
       */
    setDepthTexture(depthTexture: any, depthPacking?: number): void;
    /**
       * Renders the effect.
       *
       * This is an abstract method that must be overridden.
       *
       * @abstract
       * @throws {Error} An error is thrown if the method is not overridden.
       * @param {WebGLRenderer} renderer - The renderer.
       * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
       * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
       * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
       * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
       */
    render(renderer: any, inputBuffer: any, outputBuffer: any, deltaTime: any, stencilTest: any): void;
    /**
       * Updates this pass with the renderer's size.
       *
       * You may override this method in case you want to be informed about the size
       * of the main frame buffer.
       *
       * The {@link EffectComposer} calls this method before this pass is
       * initialized and every time its own size is updated.
       *
       * @param {Number} width - The renderer's width.
       * @param {Number} height - The renderer's height.
       * @example this.myRenderTarget.setSize(width, height);
       */
    setSize(width: any, height: any): void;
    /**
       * Performs initialization tasks.
       *
       * By overriding this method you gain access to the renderer. You'll also be
       * able to configure your custom render targets to use the appropriate format
       * (RGB or RGBA).
       *
       * The provided renderer can be used to warm up special off-screen render
       * targets by performing a preliminary render operation.
       *
       * The {@link EffectComposer} calls this method when this pass is added to its
       * queue, but not before its size has been set.
       *
       * @param {WebGLRenderer} renderer - The renderer.
       * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
       * @param {Number} frameBufferType - The type of the main frame buffers.
       * @example if(!alpha && frameBufferType === UnsignedByteType) { this.myRenderTarget.texture.format = RGBFormat; }
       */
    initialize(renderer: any, alpha: any, frameBufferType: any): void;
    /**
       * Performs a shallow search for disposable properties and deletes them. The
       * pass will be inoperative after this method was called!
       *
       * The {@link EffectComposer} calls this method when it is being destroyed.
       * You may, however, use it independently to free memory when you are certain
       * that you don't need this pass anymore.
       */
    dispose(): void;
}
