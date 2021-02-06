import { Effect } from './Effect';
/**
 * A hue/saturation effect.
 *
 * Reference: https://github.com/evanw/glfx.js
 */
export declare class HueSaturationEffect extends Effect {
    /**
       * Constructs a new hue/saturation effect.
       *
       * @param {Object} [options] - The options.
       * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
       * @param {Number} [options.hue=0.0] - The hue in radians.
       * @param {Number} [options.saturation=0.0] - The saturation factor, ranging from -1 to 1, where 0 means no change.
       */
    constructor({ blendFunction, hue, saturation }?: {
        blendFunction?: number;
        hue?: number;
        saturation?: number;
    });
    /**
       * Sets the hue.
       *
       * @param {Number} hue - The hue in radians.
       */
    setHue(hue: any): void;
}
