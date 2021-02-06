import { ShaderMaterial } from 'three';
/**
 * A CoC shader material.
 */
export declare class CircleOfConfusionMaterial extends ShaderMaterial {
    /**
       * Constructs a new CoC material.
       *
       * @param {Camera} camera - A camera.
       */
    constructor(camera: any);
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
       * Adopts the settings of the given camera.
       *
       * @param {Camera} [camera=null] - A camera.
       */
    adoptCameraSettings(camera?: any): void;
}
