import { ShaderMaterial } from 'three';
/**
 * A depth downsampling shader material.
 *
 * Based on an article by Eleni Maria Stea:
 * https://eleni.mutantstargoat.com/hikiko/depth-aware-upsampling-6
 */
export declare class DepthDownsamplingMaterial extends ShaderMaterial {
    /**
       * Constructs a new depth downsampling material.
       */
    constructor();
    /**
       * The depth packing of the source depth buffer.
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
       * Sets the texel size.
       *
       * @param {Number} x - The texel width.
       * @param {Number} y - The texel height.
       */
    setTexelSize(x: any, y: any): void;
}
