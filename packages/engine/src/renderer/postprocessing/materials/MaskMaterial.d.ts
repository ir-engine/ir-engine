import { ShaderMaterial } from 'three';
/**
 * A mask shader material.
 *
 * This material applies a mask texture to a buffer.
 */
export declare class MaskMaterial extends ShaderMaterial {
    /**
       * Constructs a new mask material.
       *
       * @param {Texture} [maskTexture] - The mask texture.
       */
    constructor(maskTexture?: any);
    /**
       * Sets the mask texture.
       *
       * @type {Texture}
       */
    set maskTexture(value: any);
    /**
       * Sets the color channel to use for masking.
       *
       * The default channel is `RED`.
       *
       * @type {ColorChannel}
       */
    set colorChannel(value: any);
    /**
       * Sets the masking technique.
       *
       * The default function is `DISCARD`.
       *
       * @type {MaskFunction}
       */
    set maskFunction(value: any);
    /**
       * Indicates whether the masking is inverted.
       *
       * @type {Boolean}
       */
    get inverted(): boolean;
    /**
       * Determines whether the masking should be inverted.
       *
       * @type {Boolean}
       */
    set inverted(value: boolean);
    /**
       * The current mask strength.
       *
       * Individual mask values will be clamped to [0.0, 1.0].
       *
       * @type {Number}
       */
    get strength(): any;
    /**
       * Sets the strength of the mask.
       *
       * Has no effect when the mask function is set to `DISCARD`.
       *
       * @type {Number}
       */
    set strength(value: any);
}
/**
 * A mask function enumeration.
 *
 * @type {Object}
 * @property {Number} DISCARD - Discards elements when the respective mask value is zero.
 * @property {Number} MULTIPLY - Multiplies the input buffer with the mask texture.
 * @property {Number} MULTIPLY_RGB_SET_ALPHA - Multiplies the input RGB values with the mask and sets alpha to the mask value.
 */
export declare const MaskFunction: {
    DISCARD: number;
    MULTIPLY: number;
    MULTIPLY_RGB_SET_ALPHA: number;
};
