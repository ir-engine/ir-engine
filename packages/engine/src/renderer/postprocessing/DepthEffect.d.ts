import { Effect } from './Effect';
/**
 * A depth visualization effect.
 *
 * Useful for debugging.
 */
export declare class DepthEffect extends Effect {
    defines: any;
    /**
       * Constructs a new depth effect.
       *
       * @param {Object} [options] - The options.
       * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
       * @param {Boolean} [options.inverted=false] - Whether the depth values should be inverted.
       */
    constructor({ blendFunction, inverted }?: {
        blendFunction?: number;
        inverted?: boolean;
    });
    /**
       * Indicates whether depth should be inverted.
       *
       * @type {Boolean}
       */
    get inverted(): any;
    /**
       * Enables or disables depth inversion.
       *
       * @type {Boolean}
       */
    set inverted(value: any);
}
