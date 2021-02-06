import { ShaderMaterial } from 'three';
/**
 * A depth comparison shader material.
 */
export declare class DepthComparisonMaterial extends ShaderMaterial {
    /**
       * Constructs a new depth comparison material.
       *
       * @param {Texture} [depthTexture=null] - A depth texture.
       * @param {PerspectiveCamera} [camera] - A camera.
       */
    constructor(depthTexture: any, camera: any);
    /**
       * Adopts the settings of the given camera.
       *
       * @param {Camera} [camera=null] - A camera.
       */
    adoptCameraSettings(camera?: any): void;
}
