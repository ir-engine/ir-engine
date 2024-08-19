/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { EventDispatcher, Uniform } from 'three'

import { BlendFunction } from './BlendFunction'
import addBlendFunction from './glsl/add/shader.frag'
import alphaBlendFunction from './glsl/alpha/shader.frag'
import averageBlendFunction from './glsl/average/shader.frag'
import colorBurnBlendFunction from './glsl/color-burn/shader.frag'
import colorDodgeBlendFunction from './glsl/color-dodge/shader.frag'
import darkenBlendFunction from './glsl/darken/shader.frag'
import differenceBlendFunction from './glsl/difference/shader.frag'
import divideBlendFunction from './glsl/divide/shader.frag'
import exclusionBlendFunction from './glsl/exclusion/shader.frag'
import lightenBlendFunction from './glsl/lighten/shader.frag'
import multiplyBlendFunction from './glsl/multiply/shader.frag'
import negationBlendFunction from './glsl/negation/shader.frag'
import normalBlendFunction from './glsl/normal/shader.frag'
import overlayBlendFunction from './glsl/overlay/shader.frag'
import reflectBlendFunction from './glsl/reflect/shader.frag'
import screenBlendFunction from './glsl/screen/shader.frag'
import softLightBlendFunction from './glsl/soft-light/shader.frag'
import subtractBlendFunction from './glsl/subtract/shader.frag'

/**
 * A blend function shader code catalogue.
 *
 * @type {Map<BlendFunction, String>}
 * @private
 */

const blendFunctions = new Map([
  [BlendFunction.SKIP, null],
  [BlendFunction.ADD, addBlendFunction],
  [BlendFunction.ALPHA, alphaBlendFunction],
  [BlendFunction.AVERAGE, averageBlendFunction],
  [BlendFunction.COLOR_BURN, colorBurnBlendFunction],
  [BlendFunction.COLOR_DODGE, colorDodgeBlendFunction],
  [BlendFunction.DARKEN, darkenBlendFunction],
  [BlendFunction.DIFFERENCE, differenceBlendFunction],
  [BlendFunction.EXCLUSION, exclusionBlendFunction],
  [BlendFunction.LIGHTEN, lightenBlendFunction],
  [BlendFunction.MULTIPLY, multiplyBlendFunction],
  [BlendFunction.DIVIDE, divideBlendFunction],
  [BlendFunction.NEGATION, negationBlendFunction],
  [BlendFunction.NORMAL, normalBlendFunction],
  [BlendFunction.OVERLAY, overlayBlendFunction],
  [BlendFunction.REFLECT, reflectBlendFunction],
  [BlendFunction.SCREEN, screenBlendFunction],
  [BlendFunction.SOFT_LIGHT, softLightBlendFunction],
  [BlendFunction.SUBTRACT, subtractBlendFunction]
])

/**
 * A blend mode.
 */

export class BlendMode extends EventDispatcher {
  blendFunction: any
  opacity: Uniform
  /**
   * Constructs a new blend mode.
   *
   * @param {BlendFunction} blendFunction - The blend function to use.
   * @param {Number} opacity - The opacity of the color that will be blended with the base color.
   */

  constructor(blendFunction, opacity = 1.0) {
    super()

    /**
     * The blend function.
     *
     * @type {BlendFunction}
     * @private
     */

    this.blendFunction = blendFunction

    /**
     * The opacity of the color that will be blended with the base color.
     *
     * @type {Uniform}
     */

    this.opacity = new Uniform(opacity)
  }

  /**
   * Returns the blend function.
   *
   * @return {BlendFunction} The blend function.
   */

  getBlendFunction() {
    return this.blendFunction
  }

  /**
   * Sets the blend function.
   *
   * @param {BlendFunction} blendFunction - The blend function.
   */

  setBlendFunction(blendFunction) {
    this.blendFunction = blendFunction
    ;(this as any).dispatchEvent({ type: 'change' })
  }

  /**
   * Returns the blend function shader code.
   *
   * @return {String} The blend function shader code.
   */

  getShaderCode() {
    return blendFunctions.get(this.blendFunction)
  }
}
