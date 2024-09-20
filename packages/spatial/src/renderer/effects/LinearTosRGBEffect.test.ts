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

import { createEngine, destroyEngine } from '@ir-engine/ecs'
import { afterEach, beforeEach, describe, it } from 'vitest'
import assert from 'assert'
import { mockSpatialEngine } from '../../../tests/util/mockSpatialEngine'
import { LinearTosRGBEffect } from './LinearTosRGBEffect'
import { BlendFunction } from './blending/BlendFunction'
import fragmentShader from './glsl/linear-to-srgb/shader.frag'

describe('LinearTosRGBEffect', () => {
  beforeEach(() => {
    createEngine()
    mockSpatialEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('constructor', () => {
    it('should create a new object with the expected default values when `@param blendFunction` is not passed', () => {
      const result = new LinearTosRGBEffect()
      assert.equal(result.name, 'LinearTosRGBEffect')
      assert.equal(result.getFragmentShader(), fragmentShader)
      assert.equal(result.blendMode.blendFunction, 23)
    })

    it('should create a new object with the expected blendFunction when `@param blendFunction` is passed', () => {
      for (const [_, fn] of Object.entries(BlendFunction)) {
        const result = new LinearTosRGBEffect({ blendFunction: fn })
        assert.equal(result.name, 'LinearTosRGBEffect')
        assert.equal(result.getFragmentShader(), fragmentShader)
        assert.equal(result.blendMode.blendFunction, fn)
      }
    })
  })
})
