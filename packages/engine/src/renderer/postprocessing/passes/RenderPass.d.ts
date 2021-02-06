import { OverrideMaterialManager } from '../core/OverrideMaterialManager';
import { ClearPass } from './ClearPass';
import { Pass } from './Pass';
/**
 * A pass that renders a given scene into the input buffer or to screen.
 *
 * This pass uses a {@link ClearPass} to clear the target buffer.
 */
export declare class RenderPass extends Pass {
    needsSwap: boolean;
    clearPass: ClearPass;
    depthTexture: any;
    overrideMaterialManager: OverrideMaterialManager;
    scene: any;
    camera: any;
    /**
       * Constructs a new render pass.
       *
       * @param {Scene} scene - The scene to render.
       * @param {Camera} camera - The camera to use to render the scene.
       * @param {Material} [overrideMaterial=null] - An override material.
       */
    constructor(scene: any, camera: any, overrideMaterial?: any);
    /**
       * Indicates whether this pass should render to screen.
       *
       * @type {Boolean}
       */
    get renderToScreen(): boolean;
    /**
       * Sets the render to screen flag.
       *
       * @type {Boolean}
       */
    set renderToScreen(value: boolean);
    /**
       * The current override material.
       *
       * @type {Material}
       */
    get overrideMaterial(): any;
    /**
       * Sets the override material.
       *
       * @type {Material}
       */
    set overrideMaterial(value: any);
    /**
       * Indicates whether the target buffer should be cleared before rendering.
       *
       * @type {Boolean}
       */
    get clear(): boolean;
    /**
       * Enables or disables auto clear.
       *
       * @type {Boolean}
       */
    set clear(value: boolean);
    /**
       * Returns the clear pass.
       *
       * @return {ClearPass} The clear pass.
       */
    getClearPass(): ClearPass;
    /**
       * Returns the current depth texture.
       *
       * @return {Texture} The current depth texture, or null if there is none.
       */
    getDepthTexture(): any;
    /**
       * Sets the depth texture.
       *
       * The provided texture will be attached to the input buffer unless this pass
       * renders to screen.
       *
       * @param {DepthTexture} depthTexture - A depth texture.
       * @param {Number} [depthPacking=0] - The depth packing.
       */
    setDepthTexture(depthTexture: any, depthPacking?: number): void;
    /**
       * Renders the scene.
       *
       * @param {WebGLRenderer} renderer - The renderer.
       * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
       * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
       * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
       * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
       */
    render(renderer: any, inputBuffer: any, outputBuffer?: any, deltaTime?: any, stencilTest?: any): void;
}
