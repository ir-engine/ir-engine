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

import {
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  getOptionalComponent,
  removeEntity,
  setComponent,
  UndefinedEntity
} from '@ir-engine/ecs'
import assert from 'assert'
import { mockSpatialEngine } from '../../../tests/util/mockSpatialEngine'
import { destroySpatialEngine } from '../../initializeEngine'
import { TransformComponent } from '../RendererModule'
import { AnimateScaleComponent } from './AnimateScaleComponent'

type AnimateScaleComponentData = { multiplier: number }
const AnimateScaleComponentDefaults = {
  multiplier: 1.05
} as AnimateScaleComponentData

function assertAnimateScaleComponentEq(A: AnimateScaleComponentData, B: AnimateScaleComponentData): void {
  assert.equal(A.multiplier, B.multiplier)
}
function assertAnimateScaleComponentNotEq(A: AnimateScaleComponentData, B: AnimateScaleComponentData): void {
  assert.notEqual(A.multiplier, B.multiplier)
}

/** @todo When VR AnimateScaleComponent works correctly */
describe.skip('AnimateScaleComponent', () => {
  describe('IDs', () => {
    it('should initialize the AnimateScaleComponent.name field with the expected value', () => {
      assert.equal(AnimateScaleComponent.name, 'AnimateScaleComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, AnimateScaleComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, AnimateScaleComponent)
      assertAnimateScaleComponentEq(data, AnimateScaleComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, AnimateScaleComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroySpatialEngine()
      return destroyEngine()
    })

    it('should change the values of an initialized AnimateScaleComponent', () => {
      const Expected = 42
      const before = getOptionalComponent(testEntity, AnimateScaleComponent)
      assertAnimateScaleComponentEq(before!, AnimateScaleComponentDefaults)
      setComponent(testEntity, AnimateScaleComponent, { multiplier: Expected })
      const after = getComponent(testEntity, AnimateScaleComponent)
      assertAnimateScaleComponentNotEq(after, AnimateScaleComponentDefaults)
    })

    it('should not change values of an initialized AnimateScaleComponent when the data passed had incorrect types', () => {
      const Incorrect = 'incorrectValue'
      const before = getOptionalComponent(testEntity, AnimateScaleComponent)
      assertAnimateScaleComponentEq(before!, AnimateScaleComponentDefaults)
      // @ts-ignore Coerce incorrectly typed data into the component
      setComponent(testEntity, AnimateScaleComponent, { multiplier: Incorrect })
      const after = getComponent(testEntity, AnimateScaleComponent)
      assertAnimateScaleComponentEq(after, AnimateScaleComponentDefaults)
    })
  }) //:: onSet

  describe('reactor', () => {}) //:: reactor
})
