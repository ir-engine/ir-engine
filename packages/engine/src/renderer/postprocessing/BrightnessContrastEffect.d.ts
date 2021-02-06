import { Effect } from './Effect';
/**
 * A brightness/contrast effect.
 *
 * Reference: https://github.com/evanw/glfx.js
 */
export declare class BrightnessContrastEffect extends Effect {
    /**
       * Constructs a new brightness/contrast effect.
       *
       * @param {Object} [options] - The options.
       * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
       * @param {Number} [options.brightness=0.0] - The brightness factor, ranging from -1 to 1, where 0 means no change.
       * @param {Number} [options.contrast=0.0] - The contrast factor, ranging from -1 to 1, where 0 means no change.
       */
    constructor({ blendFunction, brightness, contrast }?: {
        blendFunction?: number;
        brightness?: number;
        contrast?: number;
    });
}
