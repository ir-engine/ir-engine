import { Vector2, WebGLRenderer, WebGLRenderTarget } from 'three';
import { Effect } from './Effect';
/**
 * FXAA effect.
 */
export declare class FXAAEffect extends Effect {
    resolution: Vector2;
    /**
     * Constructs a new FXAA effect.
     *
     * @param {Object} [options] - The options.
     * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
     */
    constructor({ blendFunction }?: {
        blendFunction?: number;
    });
    update(renderer: WebGLRenderer, inputBuffer: WebGLRenderTarget, deltaTime: number): void;
    /**
     * Updates the size of this pass.
     *
     * @param {Number} width - The width.
     * @param {Number} height - The height.
     */
    setSize(width: number, height: number): void;
}
