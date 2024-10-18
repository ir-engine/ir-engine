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
  ECSState,
  PresentationSystemGroup,
  SystemDefinitions,
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
import { Material, Uniform, Vector3 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'

import { assertVecApproxEq } from '../../../../../tests/util/mathAssertions'
import { generateNoiseTexture } from '../../../functions/generateNoiseTexture'
import { MaterialStateComponent } from '../../MaterialComponent'
import { NoiseOffsetPluginComponent, NoiseOffsetSystem } from './NoiseOffsetPlugin'

type NoiseOffsetPluginComponentData = {
  textureSize: Uniform
  frequency: Uniform
  amplitude: Uniform
  noiseTexture: Uniform
  offsetAxis: Uniform
  time: Uniform
}

const NoiseOffsetPluginComponentDefaults: NoiseOffsetPluginComponentData = {
  textureSize: new Uniform(64),
  frequency: new Uniform(0.00025),
  amplitude: new Uniform(0.005),
  noiseTexture: new Uniform(generateNoiseTexture(64)),
  offsetAxis: new Uniform(new Vector3(0, 1, 0)),
  time: new Uniform(0)
}

function assertNoiseOffsetPluginComponentEq(
  A: NoiseOffsetPluginComponentData,
  B: NoiseOffsetPluginComponentData
): void {
  assert.deepEqual(A.textureSize, B.textureSize)
  assert.deepEqual(A.frequency, A.frequency)
  assert.deepEqual(A.amplitude, B.amplitude)
  //assert.deepEqual((A.noiseTexture as Uniform<Texture>).value.uuid, (B.noiseTexture as Uniform<Texture>).value.uuid)
  assertVecApproxEq((A.offsetAxis as Uniform<Vector3>).value, (B.offsetAxis as Uniform<Vector3>).value, 3)
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
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should set call `setPlugin` on the MaterialStateComponent.material of the entityContext', () => {
      const material = new Material()
      // Set the data as expected
      setComponent(testEntity, MaterialStateComponent, { material: material })
      // Sanity check before running
      assert.equal(getComponent(testEntity, MaterialStateComponent).material.plugins, undefined)
      // Run and Check the result
      setComponent(testEntity, NoiseOffsetPluginComponent)
      assert.notEqual(getComponent(testEntity, MaterialStateComponent).material.plugins, undefined)
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
  const System = SystemDefinitions.get(NoiseOffsetSystem)!

  describe('Fields', () => {
    it('should initialize the ClientInputSystem.uuid field with the expected value', () => {
      assert.equal(System.uuid, 'ee.spatial.material.NoiseOffsetSystem')
    })

    it('should initialize the ClientInputSystem.insert field with the expected value', () => {
      assert.notEqual(System.insert, undefined)
      assert.notEqual(System.insert!.before, undefined)
      assert.equal(System.insert!.before!, PresentationSystemGroup)
    })
  }) //:: Fields

  describe('execute', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    const noiseOffsetSystemExecute = System.execute

    it('should set `NoiseOffsetPluginComponent.time.value` to the value of `getState(ECSState).elapsedSeconds` for every entity that has a NoiseOffsetPluginComponent', () => {
      const Expected = 123456
      // Set the data as expected
      setComponent(testEntity, NoiseOffsetPluginComponent)
      const otherEntity = createEntity()
      setComponent(otherEntity, NoiseOffsetPluginComponent)
      // Sanity check before running
      const before1 = getComponent(testEntity, NoiseOffsetPluginComponent).time.value
      const before2 = getComponent(otherEntity, NoiseOffsetPluginComponent).time.value
      assert.notEqual(before1, Expected)
      assert.notEqual(before2, Expected)
      // Run and Check the result
      getMutableState(ECSState).elapsedSeconds.set(Expected)
      noiseOffsetSystemExecute()
      const result1 = getComponent(testEntity, NoiseOffsetPluginComponent).time.value
      const result2 = getComponent(otherEntity, NoiseOffsetPluginComponent).time.value
      assert.equal(result1, Expected)
      assert.equal(result2, Expected)
    })
  }) //:: execute
})
