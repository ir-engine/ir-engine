import { ShaderMaterial, Vector2 } from 'three';
/**
 * An optimised convolution shader material.
 *
 * This material supports dithering.
 *
 * Based on the GDC2003 Presentation by Masaki Kawase, Bunkasha Games:
 *  Frame Buffer Postprocessing Effects in DOUBLE-S.T.E.A.L (Wreckless)
 * and an article by Filip Strugar, Intel:
 *  An investigation of fast real-time GPU-based image blur algorithms
 *
 * Further modified according to Apple's
 * [Best Practices for Shaders](https://goo.gl/lmRoM5).
 *
 * @todo Remove dithering code from fragment shader.
 */
export declare class ConvolutionMaterial extends ShaderMaterial {
    kernelSize: number;
    /**
       * Constructs a new convolution material.
       *
       * @param {Vector2} [texelSize] - The absolute screen texel size.
       */
    constructor(texelSize?: Vector2);
    /**
       * Returns the kernel.
       *
       * @return {Float32Array} The kernel.
       */
    getKernel(): Float32Array;
    /**
       * Sets the texel size.
       *
       * @param {Number} x - The texel width.
       * @param {Number} y - The texel height.
       */
    setTexelSize(x: any, y: any): void;
}
/**
 * A kernel size enumeration.
 *
 * @type {Object}
 * @property {Number} VERY_SMALL - A very small kernel that matches a 7x7 Gauss blur kernel.
 * @property {Number} SMALL - A small kernel that matches a 15x15 Gauss blur kernel.
 * @property {Number} MEDIUM - A medium sized kernel that matches a 23x23 Gauss blur kernel.
 * @property {Number} LARGE - A large kernel that matches a 35x35 Gauss blur kernel.
 * @property {Number} VERY_LARGE - A very large kernel that matches a 63x63 Gauss blur kernel.
 * @property {Number} HUGE - A huge kernel that matches a 127x127 Gauss blur kernel.
 */
export declare const KernelSize: {
    VERY_SMALL: number;
    SMALL: number;
    MEDIUM: number;
    LARGE: number;
    VERY_LARGE: number;
    HUGE: number;
};
