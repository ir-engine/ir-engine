import { Effect } from './Effect';
/**
 * A gamma correction effect.
 *
 * @deprecated Set WebGLRenderer.outputEncoding to sRGBEncoding or GammaEncoding instead.
 */
export declare class GammaCorrectionEffect extends Effect {
    /**
       * Constructs a new gamma correction effect.
       *
       * @param {Object} [options] - The options.
       * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
       * @param {Number} [options.gamma=2.0] - The gamma factor.
       */
    constructor({ blendFunction, gamma }?: {
        blendFunction?: number;
        gamma?: number;
    });
}
