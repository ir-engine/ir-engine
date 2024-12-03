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
  EntityUUID,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  destroyEngine,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeEntity,
  serializeComponent,
  setComponent
} from '@ir-engine/ecs'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import { getState } from '@ir-engine/hyperflux'
import assert from 'assert'
import { Fog, FogExp2, MathUtils, ShaderChunk } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { assertFloat } from '../../../tests/util/assert'
import { mockSpatialEngine } from '../../../tests/util/mockSpatialEngine'
import { EngineState } from '../../EngineState'
import { destroySpatialEngine, initializeSpatialEngine } from '../../initializeEngine'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import { FogShaders as FogShadersList } from '../FogSystem'
import { RendererComponent } from '../WebGLRendererSystem'
import { FogSettingsComponent, FogType } from './FogSettingsComponent'
import { FogShaders } from './FogShaders'
import { FogComponent } from './SceneComponents'
import { VisibleComponent } from './VisibleComponent'

const FogSettingsComponentDefaults = {
  type: FogType.Disabled as FogType,
  color: '#FFFFFF',
  density: 0.005,
  near: 1,
  far: 1000,
  timeScale: 1,
  height: 0.05
}

function assertFogSettingsComponentEq(A, B): void {
  assert.equal(A.type, B.type)
  assert.equal(A.color, B.color)
  assertFloat.approxEq(A.density, B.density)
  assert.equal(A.near, B.near)
  assert.equal(A.far, B.far)
  assert.equal(A.timeScale, B.timeScale)
  assertFloat.approxEq(A.height, B.height)
}

function assertFogSettingsComponentJSONEq(A, B): void {
  assert.equal(A.type, B.type)
  assert.equal(A.color, B.color)
  assertFloat.approxEq(A.density, B.density)
  assert.equal(A.near, B.near)
  assert.equal(A.far, B.far)
  assert.equal(A.timeScale, B.timeScale)
  assertFloat.approxEq(A.height, B.height)
}

describe('FogSettingsComponent', () => {
  describe('IDs', () => {
    it('should initialize the FogSettingsComponent.name field with the expected value', () => {
      assert.equal(FogSettingsComponent.name, 'FogSettingsComponent')
    })

    it('should initialize the FogSettingsComponent.jsonID field with the expected value', () => {
      assert.equal(FogSettingsComponent.jsonID, 'EE_fog')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, FogSettingsComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, FogSettingsComponent)
      assertFogSettingsComponentEq(data, FogSettingsComponentDefaults)
    })
  }) //:: onInit

  describe('toJSON', () => {
    beforeEach(async () => {
      createEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it("should serialize the component's default data as expected", () => {
      const testEntity = createEntity()
      setComponent(testEntity, FogSettingsComponent)

      const result = serializeComponent(testEntity, FogSettingsComponent)
      const Expected = {
        type: 'disabled',
        color: '#FFFFFF',
        density: 0.005,
        near: 1,
        far: 1000,
        timeScale: 1,
        height: 0.05
      }
      assertFogSettingsComponentJSONEq(result, Expected)
    })

    it("should serialize the component's non-default data as expected", () => {
      const Data = {
        type: FogType.Exponential as FogType,
        color: '#123456',
        density: 1.234,
        near: 42,
        far: 10_000,
        timeScale: 2,
        height: 0.3
      }
      const testEntity = createEntity()
      setComponent(testEntity, FogSettingsComponent, Data)

      const result = serializeComponent(testEntity, FogSettingsComponent)
      const Expected = {
        ...Data,
        type: Data.type as string
      }
      assertFogSettingsComponentJSONEq(result, Expected)
    })
  }) //:: toJSON

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, FogSettingsComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should change the values of an initialized FogSettingsComponent', () => {
      assertFogSettingsComponentEq(getComponent(testEntity, FogSettingsComponent), FogSettingsComponentDefaults)
      const Data = {
        type: FogType.Exponential as FogType,
        color: '#123456',
        density: 1.234,
        near: 42,
        far: 10_000,
        timeScale: 2,
        height: 0.3
      }
      setComponent(testEntity, FogSettingsComponent, Data)
      const result = getComponent(testEntity, FogSettingsComponent)
      assert.notEqual(result.type, FogSettingsComponentDefaults.type)
      assert.equal(result.type, Data.type)

      assert.notEqual(result.color, FogSettingsComponentDefaults.color)
      assert.equal(result.color, Data.color)

      assertFloat.approxNotEq(result.density, FogSettingsComponentDefaults.density)
      assertFloat.approxEq(result.density, Data.density)

      assert.notEqual(result.near, FogSettingsComponentDefaults.near)
      assert.equal(result.near, Data.near)

      assert.notEqual(result.far, FogSettingsComponentDefaults.far)
      assert.equal(result.far, Data.far)

      assert.notEqual(result.timeScale, FogSettingsComponentDefaults.timeScale)
      assert.equal(result.timeScale, Data.timeScale)

      assertFloat.approxNotEq(result.height, FogSettingsComponentDefaults.height)
      assertFloat.approxEq(result.height, Data.height)
    })
  }) //:: onSet

  describe('reactor', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      initializeSpatialEngine()
      testEntity = createEntity()
      setComponent(testEntity, VisibleComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroySpatialEngine()
      return destroyEngine()
    })

    it('should trigger when fog.type changes', () => {
      setComponent(testEntity, FogSettingsComponent)
      assert.equal(getComponent(testEntity, FogSettingsComponent).type, FogType.Disabled)
      assert.equal(hasComponent(testEntity, FogComponent), false)
      // Trigger the reactor and Check the result
      setComponent(testEntity, FogSettingsComponent, { type: FogType.Linear })
      assert.equal(hasComponent(testEntity, FogComponent), true)
    })

    it('should trigger when fog.color changes', () => {
      const ExpectedString = '#000000'
      const ExpectedColor = { r: 0, g: 0, b: 0, isColor: true }
      setComponent(testEntity, FogSettingsComponent)
      assert.equal(getComponent(testEntity, FogSettingsComponent).type, FogType.Disabled)
      assert.equal(hasComponent(testEntity, FogComponent), false)
      // Sanity check the initial data
      setComponent(testEntity, FogSettingsComponent, { type: FogType.Linear })
      assert.equal(hasComponent(testEntity, FogComponent), true)
      assert.equal(getComponent(testEntity, FogSettingsComponent).color, FogSettingsComponentDefaults.color)
      // Trigger the reactor and Check the result
      setComponent(testEntity, FogSettingsComponent, { color: ExpectedString })
      assert.equal(getComponent(testEntity, FogSettingsComponent).color, ExpectedString)
      assert.deepEqual(getComponent(testEntity, FogComponent).color, ExpectedColor)
    })

    it('should trigger when fog.density changes', () => {
      const Expected = 0.42 // (default: 0.005)
      setComponent(testEntity, FogSettingsComponent)
      assert.equal(getComponent(testEntity, FogSettingsComponent).type, FogType.Disabled)
      assert.equal(hasComponent(testEntity, FogComponent), false)
      // Sanity check the initial data
      setComponent(testEntity, FogSettingsComponent, { type: FogType.Exponential })
      assert.equal(hasComponent(testEntity, FogComponent), true)
      assertFloat.approxEq(getComponent(testEntity, FogSettingsComponent).density, FogSettingsComponentDefaults.density)
      // Trigger the reactor and Check the result
      setComponent(testEntity, FogSettingsComponent, { density: Expected })
      assertFloat.approxEq(getComponent(testEntity, FogSettingsComponent).density, Expected)
      const result = getComponent(testEntity, FogComponent) as FogExp2
      assertFloat.approxEq(result.density, Expected)
    })

    it('should trigger when fog.near changes', () => {
      const Expected = 42 // (default: 1)
      setComponent(testEntity, FogSettingsComponent)
      assert.equal(getComponent(testEntity, FogSettingsComponent).type, FogType.Disabled)
      assert.equal(hasComponent(testEntity, FogComponent), false)
      // Sanity check the initial data
      setComponent(testEntity, FogSettingsComponent, { type: FogType.Exponential })
      assert.equal(hasComponent(testEntity, FogComponent), true)
      assertFloat.approxEq(getComponent(testEntity, FogSettingsComponent).density, FogSettingsComponentDefaults.density)
      // Trigger the reactor and Check the result
      setComponent(testEntity, FogSettingsComponent, { near: Expected })
      assertFloat.approxEq(getComponent(testEntity, FogSettingsComponent).near, Expected)
      const result = getComponent(testEntity, FogComponent) as Fog
      assertFloat.approxEq(result.near, Expected)
    })

    it('should trigger when fog.far changes', () => {
      const Expected = 42 // (default: 1)
      setComponent(testEntity, FogSettingsComponent)
      assert.equal(getComponent(testEntity, FogSettingsComponent).type, FogType.Disabled)
      assert.equal(hasComponent(testEntity, FogComponent), false)
      // Sanity check the initial data
      setComponent(testEntity, FogSettingsComponent, { type: FogType.Exponential })
      assert.equal(hasComponent(testEntity, FogComponent), true)
      assertFloat.approxEq(getComponent(testEntity, FogSettingsComponent).density, FogSettingsComponentDefaults.density)
      // Trigger the reactor and Check the result
      setComponent(testEntity, FogSettingsComponent, { far: Expected })
      assertFloat.approxEq(getComponent(testEntity, FogSettingsComponent).far, Expected)
      const result = getComponent(testEntity, FogComponent) as Fog
      assertFloat.approxEq(result.far, Expected)
    })

    it('should trigger when fog.height changes', () => {
      const Expected = 0.42 // (default: 0.05)
      setComponent(testEntity, FogSettingsComponent)
      assert.equal(getComponent(testEntity, FogSettingsComponent).type, FogType.Disabled)
      assert.equal(hasComponent(testEntity, FogComponent), false)
      // Sanity check the initial data
      setComponent(testEntity, FogSettingsComponent, { type: FogType.Height })
      assert.equal(hasComponent(testEntity, FogComponent), true)
      assertFloat.approxEq(getComponent(testEntity, FogSettingsComponent).height, FogSettingsComponentDefaults.height)
      // Trigger the reactor and Check the result
      setComponent(testEntity, FogSettingsComponent, { height: Expected })
      assertFloat.approxEq(getComponent(testEntity, FogSettingsComponent).height, Expected)
      for (const shader of FogShadersList) {
        assertFloat.approxEq(shader.uniforms.heightFactor.value, Expected)
      }
    })

    it('should trigger when fog.timeScale changes', () => {
      const Expected = 42 // (default: 1)
      setComponent(testEntity, FogSettingsComponent)
      assert.equal(getComponent(testEntity, FogSettingsComponent).type, FogType.Disabled)
      assert.equal(hasComponent(testEntity, FogComponent), false)
      // Sanity check the initial data
      setComponent(testEntity, FogSettingsComponent, { type: FogType.Brownian })
      assert.equal(hasComponent(testEntity, FogComponent), true)
      assertFloat.approxEq(
        getComponent(testEntity, FogSettingsComponent).timeScale,
        FogSettingsComponentDefaults.timeScale
      )
      // Trigger the reactor and Check the result
      setComponent(testEntity, FogSettingsComponent, { timeScale: Expected })
      assertFloat.approxEq(getComponent(testEntity, FogSettingsComponent).timeScale, Expected)
      for (const shader of FogShadersList) {
        assertFloat.approxEq(shader.uniforms.fogTimeScale.value, Expected)
      }
    })
  }) //:: reactor

  describe('General Purpose', () => {
    let rootEntity: Entity
    let entity: Entity

    beforeEach(() => {
      createEngine()

      mockSpatialEngine()

      rootEntity = getState(EngineState).viewerEntity

      entity = createEntity()
      setComponent(entity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
      setComponent(entity, VisibleComponent)
      setComponent(entity, FogSettingsComponent)
      setComponent(entity, EntityTreeComponent)

      setComponent(rootEntity, RendererComponent, { scenes: [entity] })
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should initialize/create a FogSettingsComponent, and all its data, as expected', () => {
      const fogSettingsComponent = getMutableComponent(entity, FogSettingsComponent)
      assert(fogSettingsComponent.value, 'fog setting component exists')

      setComponent(entity, FogSettingsComponent, {
        type: FogType.Height,
        color: '#ff0000',
        far: 2000,
        near: 2,
        density: 0.02
      })

      const fogComponent = getComponent(entity, FogComponent)
      assert(fogComponent, 'created fog component')
      assert(fogComponent.color.r == 1 && fogComponent.color.g == 0 && fogComponent.color.b == 0, 'fog set color')
      const fog = fogComponent as Fog
      assert(fog.far == 2000, 'fog set far')
      assert(fog.near == 2, 'fog set near')
      const fogExp2 = fogComponent as FogExp2
      assert(fogExp2.density == 0.02, 'fog set density')

      assert(ShaderChunk.fog_fragment == FogShaders.fog_fragment.heightFog)
      assert(ShaderChunk.fog_pars_fragment == FogShaders.fog_pars_fragment.heightFog)
      assert(ShaderChunk.fog_vertex == FogShaders.fog_vertex.heightFog)
      assert(ShaderChunk.fog_pars_vertex == FogShaders.fog_pars_vertex.heightFog)

      setComponent(entity, FogSettingsComponent, { type: FogType.Linear })

      assert(ShaderChunk.fog_fragment == FogShaders.fog_fragment.default)
      assert(ShaderChunk.fog_pars_fragment == FogShaders.fog_pars_fragment.default)
      assert(ShaderChunk.fog_vertex == FogShaders.fog_vertex.default)
      assert(ShaderChunk.fog_pars_vertex == FogShaders.fog_pars_vertex.default)

      setComponent(entity, FogSettingsComponent, { type: FogType.Brownian })

      assert(ShaderChunk.fog_fragment == FogShaders.fog_fragment.brownianMotionFog)
      assert(ShaderChunk.fog_pars_fragment == FogShaders.fog_pars_fragment.brownianMotionFog)
      assert(ShaderChunk.fog_vertex == FogShaders.fog_vertex.brownianMotionFog)
      assert(ShaderChunk.fog_pars_vertex == FogShaders.fog_pars_vertex.brownianMotionFog)
    })
  })
})
