import { ShaderMaterial } from 'three';
/**
 * A luminance shader material.
 *
 * This shader produces a greyscale luminance map that describes the absolute
 * amount of light emitted by a scene. It can also be configured to output
 * colours that are scaled with their respective luminance value. Additionally,
 * a range may be provided to mask out undesired texels.
 *
 * The alpha channel always contains the luminance value.
 *
 * On luminance coefficients:
 *  http://www.poynton.com/notes/colour_and_gamma/ColorFAQ.html#RTFToC9
 *
 * Coefficients for different colour spaces:
 *  https://hsto.org/getpro/habr/post_images/2ab/69d/084/2ab69d084f9a597e032624bcd74d57a7.png
 *
 * Luminance range reference:
 *  https://cycling74.com/2007/05/23/your-first-shader/#.Vty9FfkrL4Z
 */
export declare class LuminanceMaterial extends ShaderMaterial {
    /**
       * Constructs a new luminance material.
       *
       * @param {Boolean} [colorOutput=false] - Defines whether the shader should output colors scaled with their luminance value.
       * @param {Vector2} [luminanceRange] - If provided, the shader will mask out texels that aren't in the specified luminance range.
       */
    constructor(colorOutput?: boolean, luminanceRange?: any);
    /**
       * The luminance threshold.
       *
       * @type {Number}
       */
    get threshold(): any;
    /**
       * Sets the luminance threshold.
       *
       * @type {Number}
       */
    set threshold(value: any);
    /**
       * The luminance threshold smoothing.
       *
       * @type {Number}
       */
    get smoothing(): any;
    /**
       * Sets the luminance threshold smoothing.
       *
       * @type {Number}
       */
    set smoothing(value: any);
    /**
       * Indicates whether the luminance threshold is enabled.
       *
       * @type {Boolean}
       */
    get useThreshold(): boolean;
    /**
       * Enables or disables the luminance threshold.
       *
       * @type {Boolean}
       */
    set useThreshold(value: boolean);
    /**
       * Indicates whether color output is enabled.
       *
       * @type {Boolean}
       */
    get colorOutput(): boolean;
    /**
       * Enables or disables color output.
       *
       * @type {Boolean}
       */
    set colorOutput(value: boolean);
    /**
       * Enables or disables color output.
       *
       * @deprecated Use colorOutput instead.
       * @param {Boolean} enabled - Whether color output should be enabled.
       */
    setColorOutputEnabled(enabled: any): void;
    /**
       * Indicates whether luminance masking is enabled.
       *
       * @type {Boolean}
       */
    get useRange(): boolean;
    /**
       * Enables or disables luminance masking.
       *
       * If enabled, the threshold will be ignored.
       *
       * @type {Boolean}
       */
    set useRange(value: boolean);
    /**
       * Indicates whether luminance masking is enabled.
       *
       * @type {Boolean}
       * @deprecated Use useRange instead.
       */
    get luminanceRange(): boolean;
    /**
       * Enables or disables luminance masking.
       *
       * @type {Boolean}
       * @deprecated Use useRange instead.
       */
    set luminanceRange(value: boolean);
    /**
       * Enables or disables the luminance mask.
       *
       * @deprecated Use luminanceRange instead.
       * @param {Boolean} enabled - Whether the luminance mask should be enabled.
       */
    setLuminanceRangeEnabled(enabled: any): void;
}
