import { Effect } from './Effect';
/**
 * A sepia effect.
 */
export declare class SepiaEffect extends Effect {
    /**
       * Constructs a new sepia effect.
       *
       * @param {Object} [options] - The options.
       * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
       * @param {Number} [options.intensity=1.0] - The intensity of the effect.
       */
    constructor({ blendFunction, intensity }?: {
        blendFunction?: number;
        intensity?: number;
    });
}
