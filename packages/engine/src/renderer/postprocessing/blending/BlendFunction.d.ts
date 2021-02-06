/**
 * A blend function enumeration.
 *
 * @type {Object}
 * @property {Number} SKIP - No blending. The effect will not be included in the final shader.
 * @property {Number} ADD - Additive blending. Fast, but may produce washed out results.
 * @property {Number} ALPHA - Alpha blending. Blends based on the alpha value of the new color.
 * @property {Number} AVERAGE - Average blending.
 * @property {Number} COLOR_BURN - Color burn.
 * @property {Number} COLOR_DODGE - Color dodge.
 * @property {Number} DARKEN - Prioritize darker colors.
 * @property {Number} DIFFERENCE - Color difference.
 * @property {Number} EXCLUSION - Color exclusion.
 * @property {Number} LIGHTEN - Prioritize lighter colors.
 * @property {Number} MULTIPLY - Color multiplication.
 * @property {Number} DIVIDE - Color division.
 * @property {Number} NEGATION - Color negation.
 * @property {Number} NORMAL - Normal blending. The new color overwrites the old one.
 * @property {Number} OVERLAY - Color overlay.
 * @property {Number} REFLECT - Color reflection.
 * @property {Number} SCREEN - Screen blending. The two colors are effectively projected on a white screen simultaneously.
 * @property {Number} SOFT_LIGHT - Soft light blending.
 * @property {Number} SUBTRACT - Color subtraction.
 */
export declare const BlendFunction: {
    SKIP: number;
    ADD: number;
    ALPHA: number;
    AVERAGE: number;
    COLOR_BURN: number;
    COLOR_DODGE: number;
    DARKEN: number;
    DIFFERENCE: number;
    EXCLUSION: number;
    LIGHTEN: number;
    MULTIPLY: number;
    DIVIDE: number;
    NEGATION: number;
    NORMAL: number;
    OVERLAY: number;
    REFLECT: number;
    SCREEN: number;
    SOFT_LIGHT: number;
    SUBTRACT: number;
};
