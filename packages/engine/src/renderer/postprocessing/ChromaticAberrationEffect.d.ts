import { Vector2 } from 'three';
import { Effect } from './Effect';
/**
 * A chromatic aberration effect.
 */
export declare class ChromaticAberrationEffect extends Effect {
    uniforms: any;
    defines: any;
    /**
       * Constructs a new chromatic aberration effect.
       *
       * @param {Object} [options] - The options.
       * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
       * @param {Vector2} [options.offset] - The color offset.
       */
    constructor({ blendFunction, offset }?: {
        blendFunction?: number;
        offset?: Vector2;
    });
    /**
       * The color offset.
       *
       * @type {Vector2}
       */
    get offset(): any;
    /**
       * @type {Vector2}
       */
    set offset(value: any);
    /**
       * Performs initialization tasks.
       *
       * @param {WebGLRenderer} renderer - The renderer.
       * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
       * @param {Number} frameBufferType - The type of the main frame buffers.
       */
    initialize(renderer: any, alpha: any, frameBufferType: any): void;
}
