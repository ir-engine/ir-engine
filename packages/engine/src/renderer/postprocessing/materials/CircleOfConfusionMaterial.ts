import { PerspectiveCamera, ShaderMaterial, Uniform } from 'three';

import fragmentShader from './glsl/circle-of-confusion/shader.frag';
import vertexShader from './glsl/common/shader.vert';

/**
 * A CoC shader material.
 */

export class CircleOfConfusionMaterial extends ShaderMaterial {
  /**
	 * Constructs a new CoC material.
	 *
	 * @param {Camera} camera - A camera.
	 */

  constructor (camera) {
    super({

      type: 'CircleOfConfusionMaterial',

      defines: {
        DEPTH_PACKING: '0'
      },

      uniforms: {
        depthBuffer: new Uniform(null),
        focusDistance: new Uniform(0.0),
        focalLength: new Uniform(0.0),
        cameraNear: new Uniform(0.3),
        cameraFar: new Uniform(1000)
      },

      fragmentShader,
      vertexShader,

      depthWrite: false,
      depthTest: false

    } as any);

    /** @ignore */
    (this as any).toneMapped = false;

    this.adoptCameraSettings(camera);
  }

  /**
	 * The current depth packing.
	 *
	 * @type {Number}
	 */

  get depthPacking () {
    return Number((this as any).defines.DEPTH_PACKING);
  }

  /**
	 * Sets the depth packing.
	 *
	 * @type {Number}
	 */

  set depthPacking (value) {
    (this as any).defines.DEPTH_PACKING = value.toFixed(0);
    (this as any).needsUpdate = true;
  }

  /**
	 * Adopts the settings of the given camera.
	 *
	 * @param {Camera} [camera=null] - A camera.
	 */

  adoptCameraSettings (camera = null) {
    if (camera !== null) {
      (this as any).uniforms.cameraNear.value = camera.near;
      (this as any).uniforms.cameraFar.value = camera.far;

      if (camera instanceof PerspectiveCamera) {
        (this as any).defines.PERSPECTIVE_CAMERA = '1';
      } else {
        delete (this as any).defines.PERSPECTIVE_CAMERA;
      }

      (this as any).needsUpdate = true;
    }
  }
}
