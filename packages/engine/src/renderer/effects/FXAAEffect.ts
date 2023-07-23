/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { BlendFunction, Effect } from 'postprocessing'
import { Uniform, Vector2, WebGLRenderTarget, WebGLRenderer } from 'three'

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
        ['tDiffuse', new Uniform(null as WebGLRenderTarget | null)],
        ['resolution', new Uniform(new Vector2())]
      ] as [string, Uniform<any>][])
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
