import { BlendFunction } from 'postprocessing'
import { Uniform, Vector2, WebGLRenderTarget, WebGLRenderer } from 'three'

import { Effect } from './Effect'
import fragmentShader from './glsl/antialiasing/fxaa.frag'

/**
 * FXAA effect.
 */

export class FXAAEffect extends Effect {
  resolution: Vector2

  /**
   * Constructs a new FXAA effect.
   *
   * @param {Object} [options] - The options.
   * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
   */

  constructor({ blendFunction = BlendFunction.NORMAL } = {}) {
    super('FXAAEffect', fragmentShader, {
      blendFunction,

      uniforms: new Map([
        ['tDiffuse', new Uniform(null)],
        ['resolution', new Uniform(new Vector2())]
      ])
    })

    /**
     * The original resolution.
     *
     * @type {Vector2}
     * @private
     */
    this.resolution = new Vector2()
  }

  update(renderer: WebGLRenderer, inputBuffer: WebGLRenderTarget, deltaTime: number): void {
    ;(this as any).uniforms.get('tDiffuse').value = inputBuffer
  }

  /**
   * Updates the size of this pass.
   *
   * @param {Number} width - The width.
   * @param {Number} height - The height.
   */
  setSize(width: number, height: number): void {
    // console.log('FXAAEffect.setSize', width, height, 1/width, 1/height);
    this.resolution.set(width, height)
    ;(this as any).uniforms.get('resolution').value.set(1 / width, 1 / height)
  }
}
