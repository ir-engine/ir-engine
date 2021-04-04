import { PerspectiveCamera, ShaderMaterial, Uniform } from 'three';
import fragmentShader from './glsl/depth-comparison/shader.frag';
import vertexShader from './glsl/depth-comparison/shader.vert';

/**
 * A depth comparison shader material.
 */

export class DepthComparisonMaterial extends ShaderMaterial {
  /**
	 * Constructs a new depth comparison material.
	 *
	 * @param {Texture} [depthTexture=null] - A depth texture.
	 * @param {PerspectiveCamera} [camera] - A camera.
	 */

  constructor (depthTexture = null, camera) {
    super({

      type: 'DepthComparisonMaterial',

      uniforms: {
        depthBuffer: new Uniform(depthTexture),
        cameraNear: new Uniform(0.3),
        cameraFar: new Uniform(1000)
      },

      fragmentShader,
      vertexShader,

      depthWrite: false,
      depthTest: false,

      morphTargets: true,
      skinning: true

    } as any);

    /** @ignore */
    (this as any).toneMapped = false;

    this.adoptCameraSettings(camera);
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
    }
  }
}
