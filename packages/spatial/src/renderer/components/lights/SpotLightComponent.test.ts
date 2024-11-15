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
  removeComponent,
  removeEntity,
  serializeComponent,
  setComponent
} from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import assert from 'assert'
import { BoxGeometry, ColorRepresentation, Mesh, MeshBasicMaterial, SpotLight, Vector3 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { assertColor, assertVec } from '../../../../tests/util/assert'
import { mockSpatialEngine } from '../../../../tests/util/mockSpatialEngine'
import { LightHelperComponent } from '../../../common/debug/LightHelperComponent'
import { destroySpatialEngine } from '../../../initializeEngine'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { RendererState } from '../../RendererState'
import { GroupComponent, addObjectToGroup } from '../GroupComponent'
import { LineSegmentComponent } from '../LineSegmentComponent'
import { LightTagComponent } from './LightTagComponent'
import { SpotLightComponent } from './SpotLightComponent'

type SpotLightComponentData = {
  color: ColorRepresentation
  intensity: number
  range: number
  decay: number
  angle: number
  penumbra: number
  castShadow: boolean
  shadowBias: number
  shadowRadius: number
}

const SpotLightComponentDefaults: SpotLightComponentData = {
  color: 0xffffff,
  intensity: 10,
  range: 0,
  decay: 2,
  angle: Math.PI / 3,
  penumbra: 1,
  castShadow: false,
  shadowBias: 0.00001,
  shadowRadius: 1
}

function assertSpotLightComponentEq(A: SpotLightComponentData, B: SpotLightComponentData): void {
  assertColor.eq(A.color, B.color)
  assert.equal(A.intensity, B.intensity)
  assert.equal(A.range, B.range)
  assert.equal(A.decay, B.decay)
  assert.equal(A.angle, B.angle)
  assert.equal(A.penumbra, B.penumbra)
  assert.equal(A.castShadow, B.castShadow)
  assert.equal(A.shadowBias, B.shadowBias)
  assert.equal(A.shadowRadius, B.shadowRadius)
}

function assertSpotLightComponentNotEq(A: SpotLightComponentData, B: SpotLightComponentData): void {
  assertColor.notEq(A.color, B.color)
  assert.notEqual(A.intensity, B.intensity)
  assert.notEqual(A.range, B.range)
  assert.notEqual(A.decay, B.decay)
  assert.notEqual(A.angle, B.angle)
  assert.notEqual(A.penumbra, B.penumbra)
  assert.notEqual(A.castShadow, B.castShadow)
  assert.notEqual(A.shadowBias, B.shadowBias)
  assert.notEqual(A.shadowRadius, B.shadowRadius)
}

describe('SpotLightComponent', () => {
  describe('IDs', () => {
    it('should initialize the SpotLightComponent.name field with the expected value', () => {
      assert.equal(SpotLightComponent.name, 'SpotLightComponent')
    })

    it('should initialize the SpotLightComponent.jsonID field with the expected value', () => {
      assert.equal(SpotLightComponent.jsonID, 'EE_spot_light')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, SpotLightComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, SpotLightComponent)
      assertSpotLightComponentEq(data, SpotLightComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, SpotLightComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroySpatialEngine()
      return destroyEngine()
    })

    it('should change the values of an initialized SpotLightComponent', () => {
      const before = getComponent(testEntity, SpotLightComponent)
      assertSpotLightComponentEq(before, SpotLightComponentDefaults)
      const Expected = {
        color: 0x123456,
        intensity: 40,
        range: 41,
        decay: 42,
        angle: 43,
        penumbra: 44,
        castShadow: !SpotLightComponentDefaults.castShadow,
        shadowBias: 45,
        shadowRadius: 46
      }

      // Run and Check the result
      setComponent(testEntity, SpotLightComponent, Expected)
      const result = getComponent(testEntity, SpotLightComponent)
      assertSpotLightComponentNotEq(result, SpotLightComponentDefaults)
      assertSpotLightComponentEq(result, Expected)
    })
  }) //:: onSet

  describe('toJSON', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, SpotLightComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroySpatialEngine()
      return destroyEngine()
    })

    it("should serialize the component's default data as expected", () => {
      const Expected = {
        color: SpotLightComponentDefaults.color,
        intensity: SpotLightComponentDefaults.intensity,
        range: SpotLightComponentDefaults.range,
        decay: SpotLightComponentDefaults.decay,
        angle: SpotLightComponentDefaults.angle,
        penumbra: SpotLightComponentDefaults.penumbra,
        castShadow: SpotLightComponentDefaults.castShadow,
        shadowBias: SpotLightComponentDefaults.shadowBias,
        shadowRadius: SpotLightComponentDefaults.shadowRadius
      }
      const result = serializeComponent(testEntity, SpotLightComponent)
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
      setComponent(testEntity, SpotLightComponent)
      assert.equal(hasComponent(testEntity, LightTagComponent), true)
    })

    it('should set the light.target.position to (1,0,0) when it is mounted', () => {
      const Expected = new Vector3(1, 0, 0)

      // Set the data as expected
      const geometry = new BoxGeometry(1, 1, 1)
      const material = new MeshBasicMaterial({ color: 0xffff00 })
      setComponent(testEntity, LineSegmentComponent, { geometry: geometry, material: material })

      // Run and Check the result
      setComponent(testEntity, SpotLightComponent)
      // Check side-effect
      const light = getComponent(testEntity, GroupComponent)[1] as SpotLight
      assertVec.approxEq(light.target.position, Expected, 3)
    })

    it("should set the light.target.name to 'light-target' when it is mounted", () => {
      const Expected = 'light-target'

      // Set the data as expected
      const geometry = new BoxGeometry(1, 1, 1)
      const material = new MeshBasicMaterial({ color: 0xffff00 })
      setComponent(testEntity, LineSegmentComponent, { geometry: geometry, material: material })

      // Run and Check the result
      setComponent(testEntity, SpotLightComponent)
      // Check side-effect
      const light = getComponent(testEntity, GroupComponent)[1] as SpotLight
      assert.equal(light.target.name, Expected)
    })

    it('should create a new SpotLight object and add it to the GroupComponent of the entity when it is mounted', () => {
      setComponent(testEntity, GroupComponent)

      // Sanity check before running
      const before = getComponent(testEntity, GroupComponent)
      assert.equal(before.length, 0)

      // Run and Check the result
      setComponent(testEntity, SpotLightComponent)
      const after = getComponent(testEntity, GroupComponent)
      assert.notEqual(after.length, 0)
      assert.equal(after.length, 1)
      const result = after[0].type === 'SpotLight'
      assert.equal(result, true)
    })

    it('should remove the SpotLight object from the GroupComponent of the entityContext when it is unmounted', () => {
      setComponent(testEntity, GroupComponent)
      const DummyObject = new Mesh(new BoxGeometry())

      // Sanity check before running
      const before1 = getComponent(testEntity, GroupComponent)
      assert.equal(before1.length, 0)
      setComponent(testEntity, SpotLightComponent)
      addObjectToGroup(testEntity, DummyObject)
      const before2 = getComponent(testEntity, GroupComponent)
      assert.notEqual(before2.length, 0)
      assert.equal(before2.length, 2)
      assert.equal(before2[0].type, 'SpotLight')

      // Run and Check the result
      removeComponent(testEntity, SpotLightComponent)
      const after = getComponent(testEntity, GroupComponent)
      assert.notEqual(after.length, 2)
      assert.equal(after.length, 1)
      assert.notEqual(after[0].type, 'SpotLight')
    })

    it('should react when directionalLightComponent.color changes', () => {
      const Expected = 0x123456

      // Set the data as expected
      setComponent(testEntity, SpotLightComponent)

      // Sanity check before running
      const before = getComponent(testEntity, SpotLightComponent).color
      assertColor.eq(before, SpotLightComponentDefaults.color)

      // Run and Check the result
      setComponent(testEntity, SpotLightComponent, { color: Expected })
      const result = getComponent(testEntity, SpotLightComponent).color
      assertColor.eq(result, Expected)
      // Check side-effect
      const light = getComponent(testEntity, GroupComponent)[0] as SpotLight
      assert.equal(light.color.getHex(), Expected)
    })

    it('should react when hemisphereLightComponent.intensity changes', () => {
      const Expected = 42

      // Set the data as expected
      const geometry = new BoxGeometry(1, 1, 1)
      const material = new MeshBasicMaterial({ color: 0xffff00 })
      setComponent(testEntity, LineSegmentComponent, { geometry: geometry, material: material })
      setComponent(testEntity, SpotLightComponent)

      // Sanity check before running
      const before = getComponent(testEntity, SpotLightComponent).intensity
      assert.equal(before, SpotLightComponentDefaults.intensity)
      assert.notEqual(before, Expected)

      // Run and Check the result
      setComponent(testEntity, SpotLightComponent, { intensity: Expected })
      const result = getComponent(testEntity, SpotLightComponent).intensity
      assert.equal(result, Expected)
      // Check side-effect
      const light = getComponent(testEntity, GroupComponent)[1] as SpotLight
      assert.equal(light.intensity, Expected)
    })

    it('should react when pointLightComponent.range changes', () => {
      const Expected = 42

      // Set the data as expected
      const geometry = new BoxGeometry(1, 1, 1)
      const material = new MeshBasicMaterial({ color: 0xffff00 })
      setComponent(testEntity, LineSegmentComponent, { geometry: geometry, material: material })
      setComponent(testEntity, SpotLightComponent)

      // Sanity check before running
      const before = getComponent(testEntity, SpotLightComponent).range
      assert.equal(before, SpotLightComponentDefaults.range)
      assert.notEqual(before, Expected)

      // Run and Check the result
      setComponent(testEntity, SpotLightComponent, { range: Expected })
      const result = getComponent(testEntity, SpotLightComponent).range
      assert.equal(result, Expected)
      // Check side-effect
      const light = getComponent(testEntity, GroupComponent)[1] as SpotLight
      assert.equal(light.distance, Expected)
    })

    it('should react when pointLightComponent.decay changes', () => {
      const Expected = 42

      // Set the data as expected
      const geometry = new BoxGeometry(1, 1, 1)
      const material = new MeshBasicMaterial({ color: 0xffff00 })
      setComponent(testEntity, LineSegmentComponent, { geometry: geometry, material: material })
      setComponent(testEntity, SpotLightComponent)

      // Sanity check before running
      const before = getComponent(testEntity, SpotLightComponent).decay
      assert.equal(before, SpotLightComponentDefaults.decay)
      assert.notEqual(before, Expected)

      // Run and Check the result
      setComponent(testEntity, SpotLightComponent, { decay: Expected })
      const result = getComponent(testEntity, SpotLightComponent).decay
      assert.equal(result, Expected)
      // Check side-effect
      const light = getComponent(testEntity, GroupComponent)[1] as SpotLight
      assert.equal(light.decay, Expected)
    })

    it('should react when pointLightComponent.angle changes', () => {
      const Expected = 42

      // Set the data as expected
      const geometry = new BoxGeometry(1, 1, 1)
      const material = new MeshBasicMaterial({ color: 0xffff00 })
      setComponent(testEntity, LineSegmentComponent, { geometry: geometry, material: material })
      setComponent(testEntity, SpotLightComponent)

      // Sanity check before running
      const before = getComponent(testEntity, SpotLightComponent).angle
      assert.equal(before, SpotLightComponentDefaults.angle)
      assert.notEqual(before, Expected)

      // Run and Check the result
      setComponent(testEntity, SpotLightComponent, { angle: Expected })
      const result = getComponent(testEntity, SpotLightComponent).angle
      assert.equal(result, Expected)
      // Check side-effect
      const light = getComponent(testEntity, GroupComponent)[1] as SpotLight
      assert.equal(light.angle, Expected)
    })

    it('should react when pointLightComponent.penumbra changes', () => {
      const Expected = 42

      // Set the data as expected
      const geometry = new BoxGeometry(1, 1, 1)
      const material = new MeshBasicMaterial({ color: 0xffff00 })
      setComponent(testEntity, LineSegmentComponent, { geometry: geometry, material: material })
      setComponent(testEntity, SpotLightComponent)

      // Sanity check before running
      const before = getComponent(testEntity, SpotLightComponent).penumbra
      assert.equal(before, SpotLightComponentDefaults.penumbra)
      assert.notEqual(before, Expected)

      // Run and Check the result
      setComponent(testEntity, SpotLightComponent, { penumbra: Expected })
      const result = getComponent(testEntity, SpotLightComponent).penumbra
      assert.equal(result, Expected)
      // Check side-effect
      const light = getComponent(testEntity, GroupComponent)[1] as SpotLight
      assert.equal(light.penumbra, Expected)
    })

    it('should react when pointLightComponent.castShadow changes', () => {
      const Expected = !SpotLightComponentDefaults.castShadow

      // Set the data as expected
      const geometry = new BoxGeometry(1, 1, 1)
      const material = new MeshBasicMaterial({ color: 0xffff00 })
      setComponent(testEntity, LineSegmentComponent, { geometry: geometry, material: material })
      setComponent(testEntity, SpotLightComponent)

      // Sanity check before running
      const before = getComponent(testEntity, SpotLightComponent).castShadow
      assert.equal(before, SpotLightComponentDefaults.castShadow)
      assert.notEqual(before, Expected)

      // Run and Check the result
      setComponent(testEntity, SpotLightComponent, { castShadow: Expected })
      const result = getComponent(testEntity, SpotLightComponent).castShadow
      assert.equal(result, Expected)
      // Check side-effect
      const light = getComponent(testEntity, GroupComponent)[1] as SpotLight
      assert.equal(light.castShadow, Expected)
    })

    it('should react when pointLightComponent.shadowBias changes', () => {
      const Expected = 42

      // Set the data as expected
      const geometry = new BoxGeometry(1, 1, 1)
      const material = new MeshBasicMaterial({ color: 0xffff00 })
      setComponent(testEntity, LineSegmentComponent, { geometry: geometry, material: material })
      setComponent(testEntity, SpotLightComponent)

      // Sanity check before running
      const before = getComponent(testEntity, SpotLightComponent).shadowBias
      assert.equal(before, SpotLightComponentDefaults.shadowBias)
      assert.notEqual(before, Expected)

      // Run and Check the result
      setComponent(testEntity, SpotLightComponent, { shadowBias: Expected })
      const result = getComponent(testEntity, SpotLightComponent).shadowBias
      assert.equal(result, Expected)
      // Check side-effect
      const light = getComponent(testEntity, GroupComponent)[1] as SpotLight
      assert.equal(light.shadow.bias, Expected)
    })

    it('should react when pointLightComponent.shadowRadius changes', () => {
      const Expected = 42

      // Set the data as expected
      const geometry = new BoxGeometry(1, 1, 1)
      const material = new MeshBasicMaterial({ color: 0xffff00 })
      setComponent(testEntity, LineSegmentComponent, { geometry: geometry, material: material })
      setComponent(testEntity, SpotLightComponent)

      // Sanity check before running
      const before = getComponent(testEntity, SpotLightComponent).shadowRadius
      assert.equal(before, SpotLightComponentDefaults.shadowRadius)
      assert.notEqual(before, Expected)

      // Run and Check the result
      setComponent(testEntity, SpotLightComponent, { shadowRadius: Expected })
      const result = getComponent(testEntity, SpotLightComponent).shadowRadius
      assert.equal(result, Expected)
      // Check side-effect
      const light = getComponent(testEntity, GroupComponent)[1] as SpotLight
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
      setComponent(testEntity, SpotLightComponent)
      const before = getComponent(testEntity, GroupComponent)[1] as SpotLight
      assert.equal(before.shadow.mapSize.x, Initial)

      // Re-run and Check the result again
      getMutableState(RendererState).shadowMapResolution.set(Expected)
      SpotLightComponent.reactorMap.get(testEntity)!.run()
      const result = getComponent(testEntity, GroupComponent)[1] as SpotLight
      assert.equal(result.shadow.mapSize.x, Expected)
    })

    it('should react when debugEnabled changes', () => {
      const Initial = false
      const Expected = !Initial

      // Set the data as expected
      assert.equal(getState(RendererState).nodeHelperVisibility, false)
      getMutableState(RendererState).nodeHelperVisibility.set(Initial)

      // Run and Check the Initial result
      setComponent(testEntity, SpotLightComponent)
      assert.equal(hasComponent(testEntity, LightHelperComponent), Initial)

      // Re-run and Check the result again
      getMutableState(RendererState).nodeHelperVisibility.set(Expected)
      SpotLightComponent.reactorMap.get(testEntity)!.run()
      assert.equal(hasComponent(testEntity, LightHelperComponent), Expected)
      assert.equal(getComponent(testEntity, LightHelperComponent).name, 'spot-light-helper')

      // Re-run and Check the unmount case
      getMutableState(RendererState).nodeHelperVisibility.set(Initial)
      SpotLightComponent.reactorMap.get(testEntity)!.run()
      assert.equal(hasComponent(testEntity, LightHelperComponent), Initial)
    })
  }) //:: reactor
})
