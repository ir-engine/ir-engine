import { Effect } from './Effect';
export declare class LinearTosRGBEffect extends Effect {
    /**
       * Constructs a new effect that will convert color from linear color space to sRGB.
       *
       * @param {Object} [options] - The options.
       * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
       */
    constructor({ blendFunction }?: {
        blendFunction?: number;
    });
}
