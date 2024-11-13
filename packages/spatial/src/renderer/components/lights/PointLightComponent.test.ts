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
  Entity,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeEntity,
  serializeComponent,
  setComponent
} from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import assert from 'assert'
import { BoxGeometry, ColorRepresentation, MeshBasicMaterial, PointLight } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { assertColorEqual, assertColorNotEqual } from '../../../../tests/util/mathAssertions'
import { mockSpatialEngine } from '../../../../tests/util/mockSpatialEngine'
import { LightHelperComponent } from '../../../common/debug/LightHelperComponent'
import { destroySpatialEngine } from '../../../initializeEngine'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { RendererState } from '../../RendererState'
import { GroupComponent } from '../GroupComponent'
import { LineSegmentComponent } from '../LineSegmentComponent'
import { LightTagComponent } from './LightTagComponent'
import { PointLightComponent } from './PointLightComponent'

type PointLightComponentData = {
  color: ColorRepresentation
  intensity: number
  range: number
  decay: number
  castShadow: boolean
  shadowBias: number
  shadowRadius: number
  helperEntity: Entity | null
}

const PointLightComponentDefaults: PointLightComponentData = {
  color: 0xffffff,
  intensity: 1,
  range: 0,
  decay: 2,
  castShadow: false,
  shadowBias: 0.5,
  shadowRadius: 1,
  helperEntity: null as Entity | null
}

function assertPointLightComponentEq(A: PointLightComponentData, B: PointLightComponentData): void {
  assertColorEqual(A.color, B.color)
  assert.equal(A.intensity, B.intensity)
  assert.equal(A.range, B.range)
  assert.equal(A.decay, B.decay)
  assert.equal(A.castShadow, B.castShadow)
  assert.equal(A.shadowBias, B.shadowBias)
  assert.equal(A.shadowRadius, B.shadowRadius)
  assert.equal(A.helperEntity, B.helperEntity)
}

function assertPointLightComponentNotEq(A: PointLightComponentData, B: PointLightComponentData): void {
  assertColorNotEqual(A.color, B.color)
  assert.notEqual(A.intensity, B.intensity)
  assert.notEqual(A.range, B.range)
  assert.notEqual(A.decay, B.decay)
  assert.notEqual(A.castShadow, B.castShadow)
  assert.notEqual(A.shadowBias, B.shadowBias)
  assert.notEqual(A.shadowRadius, B.shadowRadius)
  assert.notEqual(A.helperEntity, B.helperEntity)
}

describe('PointLightComponent', () => {
  describe('IDs', () => {
    it('should initialize the PointLightComponent.name field with the expected value', () => {
      assert.equal(PointLightComponent.name, 'PointLightComponent')
    })

    it('should initialize the PointLightComponent.jsonID field with the expected value', () => {
      assert.equal(PointLightComponent.jsonID, 'EE_point_light')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, PointLightComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, PointLightComponent)
      assertPointLightComponentEq(data, PointLightComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, PointLightComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroySpatialEngine()
      return destroyEngine()
    })

    it('should change the values of an initialized PointLightComponent', () => {
      const before = getComponent(testEntity, PointLightComponent)
      assertPointLightComponentEq(before, PointLightComponentDefaults)
      const DummyEntity = Number.MAX_VALUE as Entity
      const Expected = {
        color: 0x123456,
        intensity: 40,
        range: 41,
        decay: 42,
        castShadow: !PointLightComponentDefaults.castShadow,
        shadowBias: 43,
        shadowRadius: 44,
        helperEntity: DummyEntity
      }

      // Run and Check the result
      setComponent(testEntity, PointLightComponent, Expected)
      getMutableComponent(testEntity, PointLightComponent).helperEntity.set(DummyEntity)
      const result = getComponent(testEntity, PointLightComponent)
      assertPointLightComponentNotEq(result, PointLightComponentDefaults)
      assertPointLightComponentEq(result, Expected)
    })
  }) //:: onSet

  describe('toJSON', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, PointLightComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroySpatialEngine()
      return destroyEngine()
    })

    it("should serialize the component's default data as expected", () => {
      const Expected = {
        color: PointLightComponentDefaults.color,
        intensity: PointLightComponentDefaults.intensity,
        range: PointLightComponentDefaults.range,
        decay: PointLightComponentDefaults.decay,
        castShadow: PointLightComponentDefaults.castShadow,
        shadowBias: PointLightComponentDefaults.shadowBias,
        shadowRadius: PointLightComponentDefaults.shadowRadius
      }
      const result = serializeComponent(testEntity, PointLightComponent)
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
      setComponent(testEntity, PointLightComponent)
      assert.equal(hasComponent(testEntity, LightTagComponent), true)
    })

    it('should react when directionalLightComponent.color changes', () => {
      const Expected = 0x123456

      // Set the data as expected
      setComponent(testEntity, PointLightComponent)

      // Sanity check before running
      const before = getComponent(testEntity, PointLightComponent).color
      assertColorEqual(before, PointLightComponentDefaults.color)

      // Run and Check the result
      setComponent(testEntity, PointLightComponent, { color: Expected })
      const result = getComponent(testEntity, PointLightComponent).color
      assertColorEqual(result, Expected)
      // Check side-effect
      const light = getComponent(testEntity, GroupComponent)[0] as PointLight
      assert.equal(light.color.getHex(), Expected)
    })

    it('should react when hemisphereLightComponent.intensity changes', () => {
      const Expected = 42

      // Set the data as expected
      const geometry = new BoxGeometry(1, 1, 1)
      const material = new MeshBasicMaterial({ color: 0xffff00 })
      setComponent(testEntity, LineSegmentComponent, { geometry: geometry, material: material })
      setComponent(testEntity, PointLightComponent)

      // Sanity check before running
      const before = getComponent(testEntity, PointLightComponent).intensity
      assert.equal(before, PointLightComponentDefaults.intensity)
      assert.notEqual(before, Expected)

      // Run and Check the result
      setComponent(testEntity, PointLightComponent, { intensity: Expected })
      const result = getComponent(testEntity, PointLightComponent).intensity
      assert.equal(result, Expected)
      // Check side-effect
      const light = getComponent(testEntity, GroupComponent)[1] as PointLight
      assert.equal(light.intensity, Expected)
    })

    it('should react when pointLightComponent.range changes', () => {
      const Expected = 42

      // Set the data as expected
      const geometry = new BoxGeometry(1, 1, 1)
      const material = new MeshBasicMaterial({ color: 0xffff00 })
      setComponent(testEntity, LineSegmentComponent, { geometry: geometry, material: material })
      setComponent(testEntity, PointLightComponent)

      // Sanity check before running
      const before = getComponent(testEntity, PointLightComponent).range
      assert.equal(before, PointLightComponentDefaults.range)
      assert.notEqual(before, Expected)

      // Run and Check the result
      setComponent(testEntity, PointLightComponent, { range: Expected })
      const result = getComponent(testEntity, PointLightComponent).range
      assert.equal(result, Expected)
      // Check side-effect
      const light = getComponent(testEntity, GroupComponent)[1] as PointLight
      assert.equal(light.distance, Expected)
    })

    it('should react when pointLightComponent.decay changes', () => {
      const Expected = 42

      // Set the data as expected
      const geometry = new BoxGeometry(1, 1, 1)
      const material = new MeshBasicMaterial({ color: 0xffff00 })
      setComponent(testEntity, LineSegmentComponent, { geometry: geometry, material: material })
      setComponent(testEntity, PointLightComponent)

      // Sanity check before running
      const before = getComponent(testEntity, PointLightComponent).decay
      assert.equal(before, PointLightComponentDefaults.decay)
      assert.notEqual(before, Expected)

      // Run and Check the result
      setComponent(testEntity, PointLightComponent, { decay: Expected })
      const result = getComponent(testEntity, PointLightComponent).decay
      assert.equal(result, Expected)
      // Check side-effect
      const light = getComponent(testEntity, GroupComponent)[1] as PointLight
      assert.equal(light.decay, Expected)
    })

    it('should react when pointLightComponent.castShadow changes', () => {
      const Expected = !PointLightComponentDefaults.castShadow

      // Set the data as expected
      const geometry = new BoxGeometry(1, 1, 1)
      const material = new MeshBasicMaterial({ color: 0xffff00 })
      setComponent(testEntity, LineSegmentComponent, { geometry: geometry, material: material })
      setComponent(testEntity, PointLightComponent)

      // Sanity check before running
      const before = getComponent(testEntity, PointLightComponent).castShadow
      assert.equal(before, PointLightComponentDefaults.castShadow)
      assert.notEqual(before, Expected)

      // Run and Check the result
      setComponent(testEntity, PointLightComponent, { castShadow: Expected })
      const result = getComponent(testEntity, PointLightComponent).castShadow
      assert.equal(result, Expected)
      // Check side-effect
      const light = getComponent(testEntity, GroupComponent)[1] as PointLight
      assert.equal(light.castShadow, Expected)
    })

    it('should react when pointLightComponent.shadowBias changes', () => {
      const Expected = 42

      // Set the data as expected
      const geometry = new BoxGeometry(1, 1, 1)
      const material = new MeshBasicMaterial({ color: 0xffff00 })
      setComponent(testEntity, LineSegmentComponent, { geometry: geometry, material: material })
      setComponent(testEntity, PointLightComponent)

      // Sanity check before running
      const before = getComponent(testEntity, PointLightComponent).shadowBias
      assert.equal(before, PointLightComponentDefaults.shadowBias)
      assert.notEqual(before, Expected)

      // Run and Check the result
      setComponent(testEntity, PointLightComponent, { shadowBias: Expected })
      const result = getComponent(testEntity, PointLightComponent).shadowBias
      assert.equal(result, Expected)
      // Check side-effect
      const light = getComponent(testEntity, GroupComponent)[1] as PointLight
      assert.equal(light.shadow.bias, Expected)
    })

    it('should react when pointLightComponent.shadowRadius changes', () => {
      const Expected = 42

      // Set the data as expected
      const geometry = new BoxGeometry(1, 1, 1)
      const material = new MeshBasicMaterial({ color: 0xffff00 })
      setComponent(testEntity, LineSegmentComponent, { geometry: geometry, material: material })
      setComponent(testEntity, PointLightComponent)

      // Sanity check before running
      const before = getComponent(testEntity, PointLightComponent).shadowRadius
      assert.equal(before, PointLightComponentDefaults.shadowRadius)
      assert.notEqual(before, Expected)

      // Run and Check the result
      setComponent(testEntity, PointLightComponent, { shadowRadius: Expected })
      const result = getComponent(testEntity, PointLightComponent).shadowRadius
      assert.equal(result, Expected)
      // Check side-effect
      const light = getComponent(testEntity, GroupComponent)[1] as PointLight
      assert.equal(light.shadow.radius, Expected)
    })

    it('should react when renderState.shadowMapResolution changes', () => {
      const Initial = 21
      const Expected = 42

      // Set the data as expected
      const geometry = new BoxGeometry(1, 1, 1)
      const material = new MeshBasicMaterial({ color: 0xffff00 })
      setComponent(testEntity, LineSegmentComponent, { geometry: geometry, material: material })
      getMutableState(RendererState).shadowMapResolution.set(Initial)

      // Run and Check the result
      setComponent(testEntity, PointLightComponent)
      const before = getComponent(testEntity, GroupComponent)[1] as PointLight
      assert.equal(before.shadow.mapSize.x, Initial)

      // Re-run and Check the result again
      getMutableState(RendererState).shadowMapResolution.set(Expected)
      PointLightComponent.reactorMap.get(testEntity)!.run()
      const result = getComponent(testEntity, GroupComponent)[1] as PointLight
      assert.equal(result.shadow.mapSize.x, Expected)
    })

    it('should react when debugEnabled changes', () => {
      const Initial = false
      const Expected = !Initial

      // Set the data as expected
      assert.equal(getState(RendererState).nodeHelperVisibility, false)
      getMutableState(RendererState).nodeHelperVisibility.set(Initial)

      // Run and Check the Initial result
      setComponent(testEntity, PointLightComponent)
      assert.equal(hasComponent(testEntity, LightHelperComponent), Initial)

      // Re-run and Check the result again
      getMutableState(RendererState).nodeHelperVisibility.set(Expected)
      PointLightComponent.reactorMap.get(testEntity)!.run()
      assert.equal(hasComponent(testEntity, LightHelperComponent), Expected)
      assert.equal(getComponent(testEntity, LightHelperComponent).name, 'point-light-helper')

      // Re-run and Check the unmount case
      getMutableState(RendererState).nodeHelperVisibility.set(Initial)
      PointLightComponent.reactorMap.get(testEntity)!.run()
      assert.equal(hasComponent(testEntity, LightHelperComponent), Initial)
    })
  }) //:: reactor
}) //:: PointLightComponent
