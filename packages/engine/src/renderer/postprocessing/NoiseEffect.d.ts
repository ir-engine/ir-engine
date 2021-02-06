import { Effect } from './Effect';
/**
 * A noise effect.
 */
export declare class NoiseEffect extends Effect {
    /**
       * Constructs a new noise effect.
       *
       * @param {Object} [options] - The options.
       * @param {BlendFunction} [options.blendFunction=BlendFunction.SCREEN] - The blend function of this effect.
       * @param {Boolean} [options.premultiply=false] - Whether the noise should be multiplied with the input color.
       */
    constructor({ blendFunction, premultiply }?: {
        blendFunction?: number;
        premultiply?: boolean;
    });
    /**
       * Indicates whether the noise should be multiplied with the input color.
       *
       * @type {Boolean}
       */
    get premultiply(): boolean;
    /**
       * Enables or disables noise premultiplication.
       *
       * @type {Boolean}
       */
    set premultiply(value: boolean);
}
