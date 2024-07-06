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

import assert from 'assert'

import {
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent,
  serializeComponent,
  setComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { destroyEngine } from '@etherealengine/ecs/src/Engine'
import { ReactorReconciler, getState } from '@etherealengine/hyperflux'

import { Entity, EntityUUID, UndefinedEntity, createEntity, removeEntity } from '@etherealengine/ecs'
import { createEngine } from '@etherealengine/ecs/src/Engine'
import { EngineState } from '../../EngineState'
import { initializeSpatialEngine } from '../../initializeEngine'
import { assertArrayEqual } from '../../physics/components/RigidBodyComponent.test'
import { HighlightComponent } from '../../renderer/components/HighlightComponent'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import { InputComponent } from './InputComponent'
import { InputSinkComponent } from './InputSinkComponent'

const InputComponentDefaults = {
  inputSinks: ['Self'] as EntityUUID[],
  activationDistance: 2,
  highlight: true,
  grow: false,
  inputSources: [] as Entity[]
}
function assertInputComponentEq(A, B): void {
  assertArrayEqual(A.inputSinks, B.inputSinks)
  assert.equal(A.activationDistance, B.activationDistance)
  assert.equal(A.highlight, B.highlight)
  assert.equal(A.grow, B.grow)
  assertArrayEqual(A.inputSources, B.inputSources)
}

/** @description Returns whethere or not the given `@param arr` has duplicate values. */
export function arrayHasDuplicates(arr: any[]): boolean {
  return new Set(arr).size !== arr.length
}

export function assertArrayHasDuplicates(arr: any[]) {
  assert.ok(arrayHasDuplicates(arr))
}

export function assertArrayHasNoDuplicates(arr: any[]) {
  assert.ok(!arrayHasDuplicates(arr))
}

describe('InputComponent', () => {
  describe('IDs', () => {
    it('should initialize the InputComponent.name field with the expected value', () => {
      assert.equal(InputComponent.name, 'InputComponent')
    })
  })

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, InputComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, InputComponent)
      assertInputComponentEq(data, InputComponentDefaults)
    })
  }) // << onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, InputComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should change the values of an initialized InputComponent', () => {
      const before = getComponent(testEntity, InputComponent)
      assertInputComponentEq(before, InputComponentDefaults)
      const Expected = {
        inputSinks: ['SomeUUID'] as EntityUUID[],
        activationDistance: 10_000,
        highlight: false,
        grow: true,
        inputSources: [] as Entity[]
      }
      setComponent(testEntity, InputComponent, Expected)
      const after = getComponent(testEntity, InputComponent)
      assertInputComponentEq(after, Expected)
    })

    it('should not change values of an initialized InputComponent when the data passed had incorrect types', () => {
      const before = getComponent(testEntity, InputComponent)
      assertInputComponentEq(before, InputComponentDefaults)
      const Incorrect = {
        inputSinks: false,
        activationDistance: false,
        highlight: 46 & 2,
        grow: 'invalid',
        inputSources: [] as Entity[]
      }
      // @ts-ignore Override the linter to force-send invalid types
      setComponent(testEntity, InputComponent, Incorrect)
      const after = getComponent(testEntity, InputComponent)
      assertInputComponentEq(after, InputComponentDefaults)
    })
  }) // << onSet

  describe('toJSON', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, InputComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it("should serialize the component's default data as expected", () => {
      const json = serializeComponent(testEntity, InputComponent)
      assert.ok(Array.isArray(json.inputSinks))
      assert.equal(json.inputSinks, 'Self')
      assert.equal(json.activationDistance, 2)
    })
  })

  describe('getInputEntities', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, InputComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should return an empty list when the entity does not have an InputComponent or an InputSinkComponent', () => {
      removeComponent(testEntity, InputComponent)
      const result = InputComponent.getInputEntities(testEntity)
      assert.ok(Array.isArray(result))
      assert.equal(result.length, 0)
    })

    it('should return a list containing itself when the entity has an InputComponent, but no InputSinkComponent', () => {
      const result = InputComponent.getInputEntities(testEntity)
      assert.ok(Array.isArray(result))
      assert.equal(result.length, 1)
      assert.equal(result[0], testEntity)
    })

    it('should return a list containing only the closest ancestor that has an InputComponent, even if the entity itself has no InputComponent', () => {
      removeComponent(testEntity, InputComponent)
      const parentEntity = createEntity()
      setComponent(parentEntity, InputComponent)
      setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
      const result = InputComponent.getInputEntities(testEntity)
      assert.ok(Array.isArray(result))
      assert.equal(result.length, 1)
      assert.equal(result[0], parentEntity)
    })

    it('should return a list containing the entity itself if it has an InputComponent, even if its closest ancestor also has an InputComponent', () => {
      const parentEntity = createEntity()
      setComponent(parentEntity, InputComponent)
      setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
      const result = InputComponent.getInputEntities(testEntity)
      assert.ok(Array.isArray(result))
      assert.equal(result.length, 1)
      assert.ok(result.includes(testEntity))
      assert.ok(!result.includes(parentEntity))
    })

    it('should return a de-duplicated list of Input Entities, taken from the InputSinkComponent.inputEntities of the closest ancestor of the given entity', () => {
      removeComponent(testEntity, InputComponent)
      const parentEntity = createEntity()
      const someEntity = createEntity()
      setComponent(parentEntity, InputComponent)
      setComponent(parentEntity, InputSinkComponent)
      setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
      const DummyList = [
        12345 as Entity,
        12345 as Entity,
        12345 as Entity,
        54321 as Entity,
        54321 as Entity,
        someEntity,
        someEntity
      ]
      assertArrayHasDuplicates(DummyList)
      getMutableComponent(parentEntity, InputSinkComponent).inputEntities.set(DummyList)
      const result = InputComponent.getInputEntities(testEntity)
      assertArrayHasNoDuplicates(result)
      assert.ok(
        !result.includes(testEntity),
        'the result should not contain the given entity if it does not have an InputComponent'
      )
      assert.ok(
        result.includes(parentEntity),
        'the result should contain the parent entity if it has an InputComponent'
      )
    })
  })

  /**
  // @todo
  describe('getInputSourceEntities', () => {})
  describe('getMergedButtons', () => {})
  describe('getMergedAxes', () => {})
  describe('getMergedButtonsForInputSources', () => {})
  describe('getMergedAxesForInputSources', () => {})
  describe('useExecuteWithInput', () => {})
  describe('useHasFocus', () => {})
  */

  describe('reactor', () => {
    beforeEach(() => {
      createEngine()
      initializeSpatialEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should add a HighlightComponent to the entity when the InputComponent is set with `highlight: true', async () => {
      const entity = getState(EngineState).localFloorEntity

      const Expected = { highlight: true, grow: true }
      ReactorReconciler.flushSync(() => {
        setComponent(entity, InputComponent, Expected)
      })
      const result = getComponent(entity, InputComponent)

      assert.equal(result.grow, Expected.grow)
      assert.equal(result.highlight, Expected.highlight)

      ReactorReconciler.flushSync(() => {
        getMutableComponent(entity, InputComponent).inputSources.merge([entity])
      })

      assert(hasComponent(entity, HighlightComponent))
    })
  }) // << reactor
})

/**
// @todo
describe('InputExecutionOrder', () => {})
describe('InputExecutionSystemGroup', () => {})
*/
