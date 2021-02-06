import { ShaderMaterial } from 'three';
/**
 * A crepuscular rays shader material.
 *
 * This material supports dithering.
 *
 * References:
 *
 * Thibaut Despoulain, 2012:
 *  [(WebGL) Volumetric Light Approximation in Three.js](
 *  http://bkcore.com/blog/3d/webgl-three-js-volumetric-light-godrays.html)
 *
 * Nvidia, GPU Gems 3, 2008:
 *  [Chapter 13. Volumetric Light Scattering as a Post-Process](
 *  https://developer.nvidia.com/gpugems/GPUGems3/gpugems3_ch13.html)
 *
 * @todo Remove dithering code from fragment shader.
 */
export declare class GodRaysMaterial extends ShaderMaterial {
    /**
       * Constructs a new god rays material.
       *
       * @param {Vector2} lightPosition - The light position in screen space.
       */
    constructor(lightPosition: any);
    /**
       * The amount of samples per pixel.
       *
       * @type {Number}
       */
    get samples(): number;
    /**
       * Sets the amount of samples per pixel.
       *
       * @type {Number}
       */
    set samples(value: number);
}
