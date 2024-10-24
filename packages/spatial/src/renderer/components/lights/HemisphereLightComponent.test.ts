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
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  hasComponent,
  removeEntity,
  serializeComponent,
  setComponent
} from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import assert from 'assert'
import { BoxGeometry, Color, ColorRepresentation, MeshBasicMaterial } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { assertColorEqual, assertColorNotEqual } from '../../../../tests/util/mathAssertions'
import { mockSpatialEngine } from '../../../../tests/util/mockSpatialEngine'
import { LightHelperComponent } from '../../../common/debug/LightHelperComponent'
import { destroySpatialEngine } from '../../../initializeEngine'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { RendererState } from '../../RendererState'
import { LineSegmentComponent } from '../LineSegmentComponent'
import { HemisphereLightComponent } from './HemisphereLightComponent'
import { LightTagComponent } from './LightTagComponent'

type HemisphereLightComponentData = {
  skyColor: ColorRepresentation
  groundColor: ColorRepresentation
  intensity: number
}

const HemisphereLightComponentDefaults: HemisphereLightComponentData = {
  skyColor: 0xffffff,
  groundColor: 0xffffff,
  intensity: 1
}

function assertHemisphereLightComponentEq(A: HemisphereLightComponentData, B: HemisphereLightComponentData): void {
  assertColorEqual(A.skyColor, B.skyColor)
  assertColorEqual(A.groundColor, B.groundColor)
  assert.equal(A.intensity, B.intensity)
}
function assertHemisphereLightComponentNotEq(A: HemisphereLightComponentData, B: HemisphereLightComponentData): void {
  assertColorNotEqual(A.skyColor, B.skyColor)
  assertColorNotEqual(A.groundColor, B.groundColor)
  assert.notEqual(A.intensity, B.intensity)
}

describe('HemisphereLightComponent', () => {
  describe('IDs', () => {
    it('should initialize the HemisphereLightComponent.name field with the expected value', () => {
      assert.equal(HemisphereLightComponent.name, 'HemisphereLightComponent')
    })

    it('should initialize the HemisphereLightComponent.jsonID field with the expected value', () => {
      assert.equal(HemisphereLightComponent.jsonID, 'EE_hemisphere_light')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, HemisphereLightComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, HemisphereLightComponent)
      assertHemisphereLightComponentEq(data, HemisphereLightComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, HemisphereLightComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroySpatialEngine()
      return destroyEngine()
    })

    it('should change the values of an initialized HemisphereLightComponent', () => {
      const before = getComponent(testEntity, HemisphereLightComponent)
      assertHemisphereLightComponentEq(before, HemisphereLightComponentDefaults)
      const Expected = {
        skyColor: 0x123456,
        groundColor: 0x789abc,
        intensity: 42
      }

      // Run and Check the result
      setComponent(testEntity, HemisphereLightComponent, Expected)
      const result = getComponent(testEntity, HemisphereLightComponent)
      assertHemisphereLightComponentNotEq(result, HemisphereLightComponentDefaults)
      assertHemisphereLightComponentEq(result, Expected)
    })
  }) //:: onSet

  describe('toJSON', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, HemisphereLightComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroySpatialEngine()
      return destroyEngine()
    })

    it("should serialize the component's default data as expected", () => {
      const Expected = {
        skyColor: HemisphereLightComponentDefaults.skyColor,
        groundColor: HemisphereLightComponentDefaults.groundColor,
        intensity: HemisphereLightComponentDefaults.intensity
      }
      const result = serializeComponent(testEntity, HemisphereLightComponent)
      assert.deepEqual(result, Expected)
    })
  })

  describe('reactor', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroySpatialEngine()
      return destroyEngine()
    })

    it('should set a LightTagComponent on the entityContext when it is mounted', () => {
      // Sanity check before running
      assert.equal(hasComponent(testEntity, LightTagComponent), false)

      // Run and Check the result
      setComponent(testEntity, HemisphereLightComponent)
      assert.equal(hasComponent(testEntity, LightTagComponent), true)
    })

    it('should react when directionalLightComponent.groundColor changes', () => {
      const Expected = new Color(0x123456)

      // Set the data as expected
      setComponent(testEntity, HemisphereLightComponent)

      // Sanity check before running
      const before = getComponent(testEntity, HemisphereLightComponent).groundColor
      assertColorEqual(before, HemisphereLightComponentDefaults.groundColor)

      // Run and Check the result
      setComponent(testEntity, HemisphereLightComponent, { groundColor: Expected })
      const result = getComponent(testEntity, HemisphereLightComponent).groundColor
      assertColorEqual(result, Expected)
    })

    it('should react when directionalLightComponent.skyColor changes', () => {
      const Expected = new Color(0x123456)

      // Set the data as expected
      setComponent(testEntity, HemisphereLightComponent)

      // Sanity check before running
      const before = getComponent(testEntity, HemisphereLightComponent).skyColor
      assertColorEqual(before, HemisphereLightComponentDefaults.skyColor)

      // Run and Check the result
      setComponent(testEntity, HemisphereLightComponent, { skyColor: Expected })
      const result = getComponent(testEntity, HemisphereLightComponent).skyColor
      assertColorEqual(result, Expected)
    })

    it('should react when hemisphereLightComponent.intensity changes', () => {
      const Expected = 42

      // Set the data as expected
      const geometry = new BoxGeometry(1, 1, 1)
      const material = new MeshBasicMaterial({ color: 0xffff00 })
      setComponent(testEntity, LineSegmentComponent, { geometry: geometry, material: material })
      setComponent(testEntity, HemisphereLightComponent)

      // Sanity check before running
      const before = getComponent(testEntity, HemisphereLightComponent).intensity
      assert.equal(before, HemisphereLightComponentDefaults.intensity)
      assert.notEqual(before, Expected)

      // Run and Check the result
      setComponent(testEntity, HemisphereLightComponent, { intensity: Expected })
      const result = getComponent(testEntity, HemisphereLightComponent).intensity
      assert.equal(result, Expected)
    })

    it('should react when debugEnabled changes', () => {
      const Initial = false
      const Expected = !Initial

      // Set the dassert.equalata as expected
      assert.equal(getState(RendererState).nodeHelperVisibility, false)
      getMutableState(RendererState).nodeHelperVisibility.set(Initial)

      // Run and Check the Initial result
      setComponent(testEntity, HemisphereLightComponent)
      assert.equal(hasComponent(testEntity, LightHelperComponent), Initial)

      // Re-run and Check the result again
      getMutableState(RendererState).nodeHelperVisibility.set(Expected)
      HemisphereLightComponent.reactorMap.get(testEntity)!.run()
      assert.equal(hasComponent(testEntity, LightHelperComponent), Expected)
      assert.equal(getComponent(testEntity, LightHelperComponent).name, 'hemisphere-light-helper')

      // Re-run and Check the unmount case
      getMutableState(RendererState).nodeHelperVisibility.set(Initial)
      HemisphereLightComponent.reactorMap.get(testEntity)!.run()
      assert.equal(hasComponent(testEntity, LightHelperComponent), Initial)
    })
  }) //:: reactor
}) //:: HemisphereLightComponent
