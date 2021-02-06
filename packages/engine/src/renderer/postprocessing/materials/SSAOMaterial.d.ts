import { ShaderMaterial } from 'three';
/**
 * A Screen Space Ambient Occlusion (SSAO) shader material.
 */
export declare class SSAOMaterial extends ShaderMaterial {
    /**
       * Constructs a new SSAO material.
       *
       * @param {Camera} camera - A camera.
       */
    constructor(camera: any);
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
    /**
       * Adopts the settings of the given camera.
       *
       * @param {Camera} [camera=null] - A camera.
       */
    adoptCameraSettings(camera?: any): void;
}
