import { Effect } from './Effect';
/**
 * A color depth effect.
 *
 * Simulates a hardware limitation to achieve a retro feel.
 */
export declare class ColorDepthEffect extends Effect {
    bits: number;
    uniforms: any;
    /**
       * Constructs a new color depth effect.
       *
       * @param {Object} [options] - The options.
       * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
       * @param {Number} [options.bits=16] - The color bit depth.
       */
    constructor({ blendFunction, bits }?: {
        blendFunction?: number;
        bits?: number;
    });
    /**
       * Returns the current color bit depth.
       *
       * @return {Number} The color bit depth.
       */
    getBitDepth(): number;
    /**
       * Sets the virtual amount of color bits.
       *
       * Each color channel will use a third of the available bits. The alpha
       * channel remains unaffected.
       *
       * Note that the real color depth will not be altered by this effect.
       *
       * @param {Number} bits - The new color bit depth.
       */
    setBitDepth(bits: any): void;
}
