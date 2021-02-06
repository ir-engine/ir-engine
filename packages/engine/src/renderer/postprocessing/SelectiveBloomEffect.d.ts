import { WebGLRenderTarget } from 'three';
import { Selection } from './core/Selection';
import { ClearPass } from './passes/ClearPass';
import { RenderPass } from './passes/RenderPass';
import { BloomEffect } from './BloomEffect';
/**
 * A selective bloom effect.
 *
 * This effect applies bloom only to selected objects by using layers. Make sure
 * to enable the selection layer for all relevant lights:
 *
 * `lights.forEach((l) => l.layers.enable(bloomEffect.selection.layer));`
 *
 * Attention: If you don't need to limit bloom to a subset of objects, consider
 * using the {@link BloomEffect} instead for better performance.
 */
export declare class SelectiveBloomEffect extends BloomEffect {
    scene: any;
    camera: any;
    clearPass: ClearPass;
    renderPass: RenderPass;
    blackoutPass: RenderPass;
    backgroundPass: RenderPass;
    renderTargetSelection: WebGLRenderTarget;
    selection: Selection;
    inverted: boolean;
    /**
       * Constructs a new selective bloom effect.
       *
       * @param {Scene} scene - The main scene.
       * @param {Camera} camera - The main camera.
       * @param {Object} [options] - The options. See {@link BloomEffect} for details.
       */
    constructor(scene: any, camera: any, options: any);
    /**
       * Indicates whether the scene background should be ignored.
       *
       * @type {Boolean}
       */
    get ignoreBackground(): boolean;
    /**
       * Enables or disables background rendering.
       *
       * @type {Boolean}
       */
    set ignoreBackground(value: boolean);
    /**
       * Updates this effect.
       *
       * @param {WebGLRenderer} renderer - The renderer.
       * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
       * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
       */
    update(renderer: any, inputBuffer: any, deltaTime: any): void;
    /**
       * Updates the size of internal render targets.
       *
       * @param {Number} width - The width.
       * @param {Number} height - The height.
       */
    setSize(width: any, height: any): void;
    /**
       * Performs initialization tasks.
       *
       * @param {WebGLRenderer} renderer - The renderer.
       * @param {Boolean} alpha - Whether the renderer uses the alpha channel.
       * @param {Number} frameBufferType - The type of the main frame buffers.
       */
    initialize(renderer: any, alpha: any, frameBufferType: any): void;
}
