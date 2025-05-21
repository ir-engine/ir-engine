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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import {
  ECSState,
  EntityID,
  SerializedComponentType,
  SourceID,
  SystemDefinitions,
  UUIDComponent,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  hasComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { getMutableState } from '@ir-engine/hyperflux'
import assert from 'assert'
import { Material, Vector3 } from 'three'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'

import { generateNoiseTexture } from '@ir-engine/spatial/src/renderer/functions/generateNoiseTexture'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { assertVec } from '@ir-engine/spatial/tests/util/assert'
import { makeMaterialPluginUpdateSystemID } from '../defineMaterialPlugin'
import { NoiseOffsetPluginComponent } from './NoiseOffsetPlugin'

const NoiseOffsetPluginComponentDefaults: SerializedComponentType<typeof NoiseOffsetPluginComponent> = {
  textureSize: 64,
  frequency: 0.00025,
  amplitude: 0.005,
  noiseTexture: generateNoiseTexture(64),
  offsetAxis: new Vector3(0, 1, 0),
  time: 0
}

function assertNoiseOffsetPluginComponentEq(
  A: SerializedComponentType<typeof NoiseOffsetPluginComponent>,
  B: SerializedComponentType<typeof NoiseOffsetPluginComponent>
): void {
  assert.deepEqual(A.textureSize, B.textureSize)
  assert.deepEqual(A.frequency, A.frequency)
  assert.deepEqual(A.amplitude, B.amplitude)
  //assert.deepEqual((A.noiseTexture Texture.uuid, (B.noiseTexture Texture.uuid)
  assertVec.approxEq(A.offsetAxis as Vector3, B.offsetAxis as Vector3, 3)
  assert.deepEqual(A.time, B.time)
}

describe('NoiseOffsetPluginComponent', () => {
  describe('IDs', () => {
    it('should initialize the NoiseOffsetPluginComponent.name field with the expected value', () => {
      assert.equal(NoiseOffsetPluginComponent.name, 'NoiseOffsetPluginComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, NoiseOffsetPluginComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, NoiseOffsetPluginComponent)
      assertNoiseOffsetPluginComponentEq(data, NoiseOffsetPluginComponentDefaults)
    })
  }) //:: onInit

  describe('reactor', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id' as EntityID
      })
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should set call `setPlugin` on the MaterialStateComponent.material of the entityContext', async () => {
      const material = new Material()
      // Set the data as expected
      setComponent(testEntity, MaterialStateComponent, { material: material })
      // Sanity check before running
      assert.equal(getComponent(testEntity, MaterialStateComponent).material.plugins, undefined)
      // Run and Check the result
      setComponent(testEntity, NoiseOffsetPluginComponent)
      await vi.waitFor(() => {
        assert.notEqual(getComponent(testEntity, MaterialStateComponent).material.plugins, undefined)
      })
    })

    it('should not do anything if the entityContext does not have a MaterialStateComponent', () => {
      // Sanity check before running
      assert.equal(hasComponent(testEntity, MaterialStateComponent), false)
      // Run and Check the result
      setComponent(testEntity, NoiseOffsetPluginComponent)
      assert.equal(hasComponent(testEntity, MaterialStateComponent), false)
    })
  }) //:: reactor
})

describe('NoiseOffsetSystem', () => {
  describe('execute', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id' as EntityID
      })
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should set `NoiseOffsetPluginComponent.time` to the value of `getState(ECSState).elapsedSeconds` for every entity that has a NoiseOffsetPluginComponent', async () => {
      const Expected = 123456
      // Set the data as expected
      setComponent(testEntity, NoiseOffsetPluginComponent)
      setComponent(testEntity, MaterialStateComponent, { material: new Material() })
      const System1 = await vi.waitUntil(
        () => SystemDefinitions.get(makeMaterialPluginUpdateSystemID(NoiseOffsetPluginComponent.name, testEntity))!
      )
      const noiseOffsetSystemExecute1 = System1.execute

      const otherEntity = createEntity()
      setComponent(otherEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id2' as EntityID
      })
      setComponent(otherEntity, NoiseOffsetPluginComponent)
      setComponent(otherEntity, MaterialStateComponent, { material: new Material() })
      const System2 = await vi.waitUntil(
        () => SystemDefinitions.get(makeMaterialPluginUpdateSystemID(NoiseOffsetPluginComponent.name, otherEntity))!
      )
      const noiseOffsetSystemExecute2 = System2.execute

      // Sanity check before running
      const before1 = getComponent(testEntity, NoiseOffsetPluginComponent).time
      const before2 = getComponent(otherEntity, NoiseOffsetPluginComponent).time
      assert.notEqual(before1, Expected)
      assert.notEqual(before2, Expected)

      // Run and Check the result
      getMutableState(ECSState).deltaSeconds.set(Expected)
      noiseOffsetSystemExecute1()
      noiseOffsetSystemExecute2()
      const result1 = getComponent(testEntity, NoiseOffsetPluginComponent).time
      const result2 = getComponent(otherEntity, NoiseOffsetPluginComponent).time
      assert.equal(result1, Expected)
      assert.equal(result2, Expected)
    })
  }) //:: execute
})
