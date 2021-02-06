import { Effect } from './Effect';
/**
 * Depth of Field shader v2.4.
 *
 * Yields more realistic results but is also more demanding.
 *
 * Original shader code by Martins Upitis:
 *  http://blenderartists.org/forum/showthread.php?237488-GLSL-depth-of-field-with-bokeh-v2-4-(update)
 *
 * @deprecated Use DepthOfFieldEffect instead.
 */
export declare class RealisticBokehEffect extends Effect {
    /**
       * Constructs a new bokeh effect.
       *
       * @param {Object} [options] - The options.
       * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
       * @param {Number} [options.focus=1.0] - The focus distance in world units.
       * @param {Number} [options.focalLength=24.0] - The focal length of the main camera.
       * @param {Number} [options.fStop=0.9] - The ratio of the lens focal length to the diameter of the entrance pupil (aperture).
       * @param {Number} [options.luminanceThreshold=0.5] - A luminance threshold.
       * @param {Number} [options.luminanceGain=2.0] - A luminance gain factor.
       * @param {Number} [options.bias=0.5] - A blur bias.
       * @param {Number} [options.fringe=0.7] - A blur offset.
       * @param {Number} [options.maxBlur=1.0] - The maximum blur strength.
       * @param {Boolean} [options.rings=3] - The number of blur iterations.
       * @param {Boolean} [options.samples=2] - The amount of samples taken per ring.
       * @param {Boolean} [options.showFocus=false] - Whether the focal point should be highlighted. Useful for debugging.
       * @param {Boolean} [options.manualDoF=false] - Enables manual control over the depth of field.
       * @param {Boolean} [options.pentagon=false] - Enables pentagonal blur shapes. Requires a high number of rings and samples.
       */
    constructor({ blendFunction, focus, focalLength, fStop, luminanceThreshold, luminanceGain, bias, fringe, maxBlur, rings, samples, showFocus, manualDoF, pentagon }?: {
        blendFunction?: number;
        focus?: number;
        focalLength?: number;
        fStop?: number;
        luminanceThreshold?: number;
        luminanceGain?: number;
        bias?: number;
        fringe?: number;
        maxBlur?: number;
        rings?: number;
        samples?: number;
        showFocus?: boolean;
        manualDoF?: boolean;
        pentagon?: boolean;
    });
    /**
       * The amount of blur iterations.
       *
       * @type {Number}
       */
    get rings(): number;
    /**
       * Sets the amount of blur iterations.
       *
       * @type {Number}
       */
    set rings(value: number);
    /**
       * The amount of blur samples per ring.
       *
       * @type {Number}
       */
    get samples(): number;
    /**
       * Sets the amount of blur samples per ring.
       *
       * @type {Number}
       */
    set samples(value: number);
    /**
       * Indicates whether the focal point will be highlighted.
       *
       * @type {Boolean}
       */
    get showFocus(): boolean;
    /**
       * Enables or disables focal point highlighting.
       *
       * @type {Boolean}
       */
    set showFocus(value: boolean);
    /**
       * Indicates whether the Depth of Field should be calculated manually.
       *
       * If enabled, the Depth of Field can be adjusted via the `dof` uniform.
       *
       * @type {Boolean}
       */
    get manualDoF(): boolean;
    /**
       * Enables or disables manual Depth of Field.
       *
       * @type {Boolean}
       */
    set manualDoF(value: boolean);
    /**
       * Indicates whether the blur shape should be pentagonal.
       *
       * @type {Boolean}
       */
    get pentagon(): boolean;
    /**
       * Enables or disables pentagonal blur.
       *
       * @type {Boolean}
       */
    set pentagon(value: boolean);
}
