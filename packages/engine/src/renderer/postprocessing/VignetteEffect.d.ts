import { Effect } from './Effect';
/**
 * A vignette effect.
 */
export declare class VignetteEffect extends Effect {
    /**
       * Constructs a new vignette effect.
       *
       * @param {Object} [options] - The options.
       * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
       * @param {Boolean} [options.eskil=false] - Enables Eskil's vignette technique.
       * @param {Number} [options.offset=0.5] - The vignette offset.
       * @param {Number} [options.darkness=0.5] - The vignette darkness.
       */
    constructor(options?: {});
    /**
       * Indicates whether Eskil's vignette technique is enabled.
       *
       * @type {Boolean}
       */
    get eskil(): boolean;
    /**
       * Enables or disables Eskil's vignette technique.
       *
       * @type {Boolean}
       */
    set eskil(value: boolean);
}
