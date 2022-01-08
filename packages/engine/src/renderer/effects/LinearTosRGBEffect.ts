import { BlendFunction } from 'postprocessing'

import { Effect } from './Effect'
import fragmentShader from './glsl/linear-to-srgb/shader.frag'

// https://discourse.threejs.org/t/srgb-encoding-as-a-postprocess-pass/12278/11
export class LinearTosRGBEffect extends Effect {
  /**
   * Constructs a new effect that will convert color from linear color space to sRGB.
   *
   * @param {Object} [options] - The options.
   * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
   */

  constructor({ blendFunction = BlendFunction.NORMAL } = {}) {
    super('LinearTosRGBEffect', fragmentShader, {
      blendFunction
    })
  }
}
