import { ShaderMaterial, Vector2 } from 'three';
/**
 * An edge detection material.
 *
 * Mainly used for Subpixel Morphological Antialiasing.
 */
export declare class EdgeDetectionMaterial extends ShaderMaterial {
    /**
       * Constructs a new edge detection material.
       *
       * @param {Vector2} [texelSize] - The screen texel size.
       * @param {EdgeDetectionMode} [mode=EdgeDetectionMode.COLOR] - The edge detection mode.
       * @todo Remove texelSize parameter.
       */
    constructor(texelSize?: Vector2, mode?: number);
    /**
       * The current depth packing.
       *
       * @type {Number}
       */
    get depthPacking(): number;
    /**
       * Sets the depth packing.
       *
       * @type {Number}
       */
    set depthPacking(value: number);
    /**
       * Sets the edge detection mode.
       *
       * Warning: If you intend to change the edge detection mode at runtime, make
       * sure that {@link EffectPass.needsDepthTexture} is set to `true` _before_
       * the EffectPass is added to the composer.
       *
       * @param {EdgeDetectionMode} mode - The edge detection mode.
       */
    setEdgeDetectionMode(mode: any): void;
    /**
       * Sets the local contrast adaptation factor. Has no effect if the edge
       * detection mode is set to DEPTH.
       *
       * If there is a neighbor edge that has _factor_ times bigger contrast than
       * the current edge, the edge will be discarded.
       *
       * This allows to eliminate spurious crossing edges and is based on the fact
       * that if there is too much contrast in a direction, the perceptual contrast
       * in the other neighbors will be hidden.
       *
       * @param {Number} factor - The local contrast adaptation factor. Default is 2.0.
       */
    setLocalContrastAdaptationFactor(factor: any): void;
    /**
       * Sets the edge detection sensitivity.
       *
       * A lower value results in more edges being detected at the expense of
       * performance.
       *
       * 0.1 is a reasonable value, and allows to catch most visible edges.
       * 0.05 is a rather overkill value, that allows to catch 'em all.
       *
       * If temporal supersampling is used, 0.2 could be a reasonable value, as low
       * contrast edges are properly filtered by just 2x.
       *
       * @param {Number} threshold - The edge detection sensitivity. Range: [0.05, 0.5].
       */
    setEdgeDetectionThreshold(threshold: any): void;
}
/**
 * An enumeration of edge detection modes.
 *
 * @type {Object}
 * @property {Number} DEPTH - Depth-based edge detection.
 * @property {Number} LUMA - Luminance-based edge detection.
 * @property {Number} COLOR - Chroma-based edge detection.
 */
export declare const EdgeDetectionMode: {
    DEPTH: number;
    LUMA: number;
    COLOR: number;
};
