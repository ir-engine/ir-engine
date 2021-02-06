import { Effect } from './Effect';
/**
 * A depth of field (bokeh) effect.
 *
 * Original shader code by Martins Upitis:
 *  http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
 *
 * @deprecated Use DepthOfFieldEffect instead.
 */
export declare class BokehEffect extends Effect {
    /**
       * Constructs a new bokeh effect.
       *
       * @param {Object} [options] - The options.
       * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
       * @param {Number} [options.focus=0.5] - The focus distance ratio, ranging from 0.0 to 1.0.
       * @param {Number} [options.dof=0.02] - Depth of field. An area in front of and behind the focal point that still appears sharp.
       * @param {Number} [options.aperture=0.015] - Camera aperture scale. Bigger values for stronger blur and shallower depth of field.
       * @param {Number} [options.maxBlur=1.0] - The maximum blur strength.
       */
    constructor({ blendFunction, focus, dof, aperture, maxBlur }?: {
        blendFunction?: number;
        focus?: number;
        dof?: number;
        aperture?: number;
        maxBlur?: number;
    });
}
