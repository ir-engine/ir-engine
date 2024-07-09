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

import {
  Entity,
  EntityUUID,
  InputSystemGroup,
  SystemDefinitions,
  UndefinedEntity,
  createEntity,
  removeEntity
} from '@etherealengine/ecs'
import { createEngine } from '@etherealengine/ecs/src/Engine'
import { EngineState } from '../../EngineState'
import { initializeSpatialEngine } from '../../initializeEngine'
import { assertArrayEqual } from '../../physics/components/RigidBodyComponent.test'
import { HighlightComponent } from '../../renderer/components/HighlightComponent'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import { DefaultButtonAlias, InputComponent, InputExecutionOrder, InputExecutionSystemGroup } from './InputComponent'
import { InputSinkComponent } from './InputSinkComponent'
import { InputSourceComponent } from './InputSourceComponent'

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

/** @description Alias to create a dummy entity with an InputComponent. Used for syntax ergonomics. */
function createDummyEntity(): Entity {
  const result = createEntity()
  setComponent(result, InputComponent)
  return result
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
      setComponent(parentEntity, InputComponent)
      setComponent(parentEntity, InputSinkComponent)
      setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
      const DummyList = [
        12345 as Entity,
        12345 as Entity,
        12345 as Entity,
        54321 as Entity,
        54321 as Entity,
        parentEntity,
        parentEntity
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

  describe('getInputSourceEntities', () => {
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

    /**
     * @note
     * This test's setup is a bit complex, but it does test what the code is supposed to do.
     * The notes are left for reference, since the setup can be confusing. */
    it('should return a combined list of all entities contained in the InputComponent.inputSources of all entities returned by InputComponent.getInputEntities(entityContext)', () => {
      removeComponent(testEntity, InputComponent)
      const parentEntity = createEntity()
      setComponent(parentEntity, InputComponent)
      // `one`, `two`, `three` and `four` are valid entities that have an all-defaults InputComponent
      const one = createDummyEntity()
      const two = createDummyEntity()
      const three = createDummyEntity()
      const four = createDummyEntity()
      const DummyList0 = [12345 as Entity, 54321 as Entity, one, two] as Entity[]
      // DummyList0 is added to parentEntity.InputComponent.inputSources
      getMutableComponent(parentEntity, InputComponent).inputSources.set(DummyList0)
      // DummyList3 is added to three.InputComponent.inputSources
      const DummyList3 = [98765 as Entity, 55544 as Entity] as Entity[]
      getMutableComponent(three, InputComponent).inputSources.set(DummyList3)
      // DummyList4 is added to four.InputComponent.inputSources
      const DummyList4 = [42424 as Entity, 21212 as Entity] as Entity[]
      getMutableComponent(four, InputComponent).inputSources.set(DummyList4)
      // SinkList is created with entities `three` and `four`
      // We will retrieve DummyList3 and DummyList4 from their inputSources in the result call
      const SinkList = [three, four] as Entity[]
      // SinkList is set as parentEntity.InputSinkComponent.inputEntities
      setComponent(parentEntity, InputSinkComponent)
      getMutableComponent(parentEntity, InputSinkComponent).inputEntities.set(SinkList)
      // parentEntity is set as the parent of testEntity
      setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
      // The result should contain all other lists combined
      const Expected = DummyList0.concat(DummyList3).concat(DummyList4)
      // 1. We retrieve DummyList0 from parentEntity's inputSources
      // 2. We retrieve DummyList3 from the inputSources of entity `three`, which are accessed from the parentEntity.InputSinkComponent
      // 3. We retrieve DummyList4 from the inputSources of entity `four`, which are accessed from the parentEntity.InputSinkComponent
      const result = InputComponent.getInputSourceEntities(testEntity)
      assert.ok(result.length > 0, 'The result should not be empty')
      assertArrayEqual(
        result,
        Expected,
        'The result should contain the expected lists of inputSources combined, no matter what their values are'
      )
    })
  })

  describe('getMergedButtonsForInputSources', () => {
    beforeEach(async () => {
      createEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should copy all buttons defined by the InputSourceComponent.buttons of all `@param inputSourceEntities` into the resulting object', () => {
      // Create the list of expected keys
      const Expected = ['0', '1', '2', '3']
      // Create the list of buttons that should be returned
      const Down = { down: true }
      const Buttons1 = {}
      const Buttons2 = {}
      Buttons1[Expected[0]] = Down
      Buttons1[Expected[1]] = Down
      Buttons2[Expected[2]] = Down
      Buttons2[Expected[3]] = Down
      // Create the entities that will contain the buttons
      const ent1 = createEntity()
      const ent2 = createEntity()
      setComponent(ent1, InputSourceComponent)
      setComponent(ent2, InputSourceComponent)
      getMutableComponent(ent1, InputSourceComponent).buttons.set(Buttons1)
      getMutableComponent(ent2, InputSourceComponent).buttons.set(Buttons2)
      // Call the function with the list of entities we just created
      const list = [ent1, ent2]
      const result = InputComponent.getMergedButtonsForInputSources(list)
      // Check that all buttons were added to the the resulting object
      for (const key of Expected) {
        assert.ok(result[key] !== undefined, 'Expected key: ' + key + ' should be contained in the result')
      }
    })

    it('should return an object with the default shape when `@param inputAlias` is omitted', () => {
      // Create the list of expected keys
      const Expected = ['0', '1', '2', '3']
      for (const key of Object.keys(DefaultButtonAlias)) {
        Expected.push(key)
      }
      // Create the list of buttons that should be returned
      const Down = { down: true }
      const Buttons1 = {}
      const Buttons2 = {}
      Buttons1[Expected[0]] = Down
      Buttons1[Expected[1]] = Down
      Buttons2[Expected[2]] = Down
      Buttons2[Expected[3]] = Down
      // Create the entities that will contain the buttons
      const ent1 = createEntity()
      const ent2 = createEntity()
      setComponent(ent1, InputSourceComponent)
      setComponent(ent2, InputSourceComponent)
      getMutableComponent(ent1, InputSourceComponent).buttons.set(Buttons1)
      getMutableComponent(ent2, InputSourceComponent).buttons.set(Buttons2)
      // Call the function with the list of entities we just created
      const list = [ent1, ent2]
      const result = InputComponent.getMergedButtonsForInputSources(list)
      // Check that all keys of the result object are contained in the list of expected keys
      for (const key of Object.keys(result)) {
        assert.ok(Expected.includes(key), key + ' should be contained in the result')
      }
    })

    it('should create fields in the resulting object for all aliases described by `@param inputAlias`', () => {
      // Create the `@param inputAlias` object
      const SomeAliasList = {
        SomeKeyOne: [0, 1],
        SomeKeyTwo: [2, 3]
      }
      // Create the list of expected keys
      const Expected = ['0', '1', '2', '3']
      for (const key of Object.keys(SomeAliasList)) {
        Expected.push(key)
      }
      // Create the list of buttons that should be returned
      const Down = { down: true }
      const Buttons1 = {}
      const Buttons2 = {}
      Buttons1[Expected[0]] = Down
      Buttons1[Expected[1]] = Down
      Buttons2[Expected[2]] = Down
      Buttons2[Expected[3]] = Down
      // Create the entities that will contain the buttons
      const ent1 = createEntity()
      const ent2 = createEntity()
      setComponent(ent1, InputSourceComponent)
      setComponent(ent2, InputSourceComponent)
      getMutableComponent(ent1, InputSourceComponent).buttons.set(Buttons1)
      getMutableComponent(ent2, InputSourceComponent).buttons.set(Buttons2)
      // Call the function with the list of entities we just created
      const list = [ent1, ent2]
      const result = InputComponent.getMergedButtonsForInputSources(list, SomeAliasList)
      // Check that all keys of the given inputAlias object are contained in the result
      for (const key of Object.keys(result)) {
        assert.ok(Expected.includes(key), key + ' should be contained in the result')
      }
    })

    it('should collapse the state of the button aliases described by `@param inputAlias` (or the default) into a single field of the same name in the result object', () => {
      // Create the `@param inputAlias` object
      const SomeAliasList = {
        SomeKeyOne: ['0', '1'],
        SomeKeyTwo: ['2', '3']
      }
      // Create the list of expected keys
      const Expected = ['0', '1', '2', '3']
      for (const key of Object.keys(SomeAliasList)) {
        Expected.push(key)
      }
      // Create the list of buttons that should be returned
      const Down = { down: true }
      const NotDown = { down: false }
      const Buttons1 = {}
      const Buttons2 = {}
      // Set the state of the buttons
      Buttons1[Expected[0]] = Down
      Buttons1[Expected[1]] = NotDown // should be synchronized with [0] in result.SomeKeyOne
      Buttons2[Expected[2]] = Down
      Buttons2[Expected[3]] = NotDown // should be synchronized with [2] in result.SomeKeyTwo
      // Create the entities that will contain the buttons
      const ent1 = createEntity()
      const ent2 = createEntity()
      setComponent(ent1, InputSourceComponent)
      setComponent(ent2, InputSourceComponent)
      getMutableComponent(ent1, InputSourceComponent).buttons.set(Buttons1)
      getMutableComponent(ent2, InputSourceComponent).buttons.set(Buttons2)
      // Call the function with the list of entities we just created
      const list = [ent1, ent2]
      const result = InputComponent.getMergedButtonsForInputSources(list, SomeAliasList)
      // Check that all keys of the resulting object have the expected state
      assert.equal(result[Expected[0]].down, true)
      assert.equal(result[Expected[1]].down, false)
      assert.equal(result[Expected[2]].down, true)
      assert.equal(result[Expected[3]].down, false)
      assert.equal(result[Expected[4]].down, true)
      assert.equal(result[Expected[5]].down, true)
    })
  })

  describe('getMergedButtons', () => {
    let testEntity = UndefinedEntity
    let parentEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      parentEntity = createEntity()
      setComponent(parentEntity, InputComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      removeEntity(parentEntity)
      return destroyEngine()
    })

    it('should contain all buttons held by the entities returned by getInputSourceEntities for the given `@param entityContext`', () => {
      const Expected = ['1', '2', '3']
      const Down = { down: true }
      const NotDown = { down: false }
      const Buttons1 = {}
      const Buttons2 = {}
      const Buttons3 = {}
      // Set the state of the buttons
      Buttons1[Expected[0]] = Down
      Buttons2[Expected[1]] = NotDown
      Buttons3[Expected[2]] = Down
      // `one`, `two` and `three` are valid entities that have an all-defaults InputComponent
      const one = createEntity()
      const two = createEntity()
      const three = createEntity()
      // We add the key sources to each entity
      setComponent(one, InputSourceComponent)
      setComponent(two, InputSourceComponent)
      setComponent(three, InputSourceComponent)
      getMutableComponent(one, InputSourceComponent).buttons.set(Buttons1)
      getMutableComponent(two, InputSourceComponent).buttons.set(Buttons2)
      getMutableComponent(three, InputSourceComponent).buttons.set(Buttons3)
      // Create the entity that the InputSink will reference
      const inputEntity = createEntity()
      setComponent(inputEntity, InputComponent)
      getMutableComponent(inputEntity, InputComponent).inputSources.set([two, three])
      // Set the parentEntity as both an Input and an InputSink
      //  @note (might not make sense conceptually. this is just to test this codepath)
      setComponent(parentEntity, InputComponent)
      getMutableComponent(parentEntity, InputComponent).inputSources.set([one])
      // The parentEntity is the InputSink where we get the inputs from
      setComponent(parentEntity, InputSinkComponent)
      getMutableComponent(parentEntity, InputSinkComponent).inputEntities.set([inputEntity])
      // parentEntity is set as the parent of testEntity
      setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
      // The result should contain the buttons listed by all entities combined, retrieved by calling the function with `testEntity`
      const result = InputComponent.getMergedButtons(testEntity)
      for (const key of Expected) {
        assert.ok(result[key] !== undefined, 'Expected key: ' + key + ' should be contained in the result')
      }
    })

    it('should collapse the state of all buttons described by the given `@param inputAlias` into keys of the same name in the resulting object', () => {
      // Create the `@param inputAlias` object
      const SomeAliasList = {
        SomeKeyOne: ['0', '1'],
        SomeKeyTwo: ['2', '3']
      }
      const Down = { down: true }
      const NotDown = { down: false }
      const Buttons1 = {}
      const Buttons2 = {}
      // Create the list of expected keys
      const Expected = ['0', '1', '2', '3']
      for (const key of Object.keys(SomeAliasList)) {
        Expected.push(key)
      }
      // Set the state of the buttons
      Buttons1[Expected[0]] = Down
      Buttons1[Expected[1]] = NotDown
      Buttons2[Expected[2]] = Down
      Buttons2[Expected[3]] = NotDown
      // Create the input sources that contain the button states
      const one = createEntity()
      const two = createEntity()
      setComponent(one, InputSourceComponent)
      setComponent(two, InputSourceComponent)
      getMutableComponent(one, InputSourceComponent).buttons.set(Buttons1)
      getMutableComponent(two, InputSourceComponent).buttons.set(Buttons2)
      // Add the input sources to the InputComponent of testEntity
      setComponent(testEntity, InputComponent)
      getMutableComponent(testEntity, InputComponent).inputSources.set([one, two])
      // Run the process
      const result = InputComponent.getMergedButtons(testEntity, SomeAliasList)
      // Check that all expected keys are being added to the result
      for (const key of Object.keys(result)) {
        assert.ok(Expected.includes(key), key + ' should be contained in the result')
      }
      // Check that all keys of the resulting object have the expected state
      assert.equal(result[Expected[0]].down, true)
      assert.equal(result[Expected[1]].down, false)
      assert.equal(result[Expected[2]].down, true)
      assert.equal(result[Expected[3]].down, false)
      assert.equal(result[Expected[4]].down, true)
      assert.equal(result[Expected[5]].down, true)
    })
  })

  /**
  // @todo
  describe('getMergedAxes', () => {})
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

describe('InputExecutionOrder', () => {
  it('should be described using the expected values', () => {
    assert.equal(InputExecutionOrder.Before, -1)
    assert.equal(InputExecutionOrder.With, 0)
    assert.equal(InputExecutionOrder.After, 1)
  })
})

describe('InputExecutionSystemGroup', () => {
  describe('Fields', () => {
    const System = SystemDefinitions.get(InputExecutionSystemGroup)

    it('should initialize the InputExecutionSystemGroup.uuid field with the expected value', () => {
      assert.equal(System!.uuid, 'ee.engine.InputExecutionSystemGroup')
    })

    it('should initialize the InputExecutionSystemGroup.insert field with the expected value', () => {
      assert.notEqual(System!.insert, undefined)
      assert.notEqual(System!.insert!.with, undefined)
      assert.equal(System!.insert!.with!, InputSystemGroup)
    })
  })
})
