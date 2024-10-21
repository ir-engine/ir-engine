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

import '@hookstate/core'
import assert from 'assert'
import React, { useEffect } from 'react'
import sinon from 'sinon'
import { afterEach, beforeEach, describe, it } from 'vitest'

import {
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent,
  serializeComponent,
  setComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'
import { ReactorReconciler, ReactorRoot, getMutableState, getState, startReactor } from '@ir-engine/hyperflux'

import {
  Entity,
  EntityContext,
  EntityUUID,
  InputSystemGroup,
  SystemDefinitions,
  UndefinedEntity,
  createEntity,
  removeEntity
} from '@ir-engine/ecs'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import { Raycaster } from 'three'
import {
  assertArrayEqual,
  assertArrayHasDuplicates,
  assertArrayHasNoDuplicates
} from '../../../tests/util/mathAssertions'
import { EngineState } from '../../EngineState'
import { initializeSpatialEngine } from '../../initializeEngine'
import { HighlightComponent } from '../../renderer/components/HighlightComponent'
import { EntityTreeComponent, isAncestor } from '../../transform/components/EntityTree'
import { ButtonStateMap, MouseScroll, XRStandardGamepadAxes } from '../state/ButtonState'
import { InputState } from '../state/InputState'
import { DefaultButtonAlias, InputComponent, InputExecutionOrder, InputExecutionSystemGroup } from './InputComponent'
import { InputSinkComponent } from './InputSinkComponent'
import { InputSourceComponent } from './InputSourceComponent'

type InputComponentData = {
  inputSinks: EntityUUID[]
  activationDistance: number
  highlight: boolean
  grow: boolean
  inputSources: Entity[]
}

const InputComponentDefaults: InputComponentData = {
  inputSinks: ['Self'] as EntityUUID[],
  activationDistance: 2,
  highlight: false,
  grow: false,
  inputSources: [] as Entity[]
}

function assertInputComponentEq(A: InputComponentData, B: InputComponentData): void {
  assertArrayEqual(A.inputSinks, B.inputSinks)
  assert.equal(A.activationDistance, B.activationDistance)
  assert.equal(A.highlight, B.highlight)
  assert.equal(A.grow, B.grow)
  assertArrayEqual(A.inputSources, B.inputSources)
}

/** @description Alias to create a dummy entity with an InputComponent. Used for syntax ergonomics. */
function createDummyEntity(): Entity {
  const result = createEntity()
  setComponent(result, InputComponent)
  return result
}

/** @description Returns a dummy XRInputSource object containing the given `@param mapping` as its {@link XRInputSource.gamepad.mapping} */
function getDummyMapping(mapping: GamepadMappingType): XRInputSource {
  return {
    gamepad: {
      axes: [0, 0, 0, 0],
      buttons: [],
      connected: true,
      hapticActuators: [],
      // id: 'emulated-gamepad-1',  // @note The attached number is unreliable on tests. Requires the entity number
      index: 0,
      mapping: mapping,
      // timestamp: performance.now(),  // @note Unreliable on tests
      vibrationActuator: null
    },
    gripSpace: undefined,
    hand: undefined,
    handedness: 'none',
    profiles: [],
    targetRayMode: 'screen',
    targetRaySpace: {}
  } as unknown as XRInputSource
}

/** @description Alias for the type expected by {@link InputSourceComponent.source.gamepad.axes} */
type Axes = [number, number, number, number]
/** @description Returns a dummy InputSourceComponent object containing the given `@param axes` */
function getDummyAxes(axes: Axes) {
  return {
    source: {
      gamepad: {
        axes: axes,
        buttons: [],
        connected: true,
        hapticActuators: [],
        // id: 'emulated-gamepad-1',  // @note The attached number is unreliable on tests. Requires the entity number
        index: 0,
        mapping: '' as GamepadMappingType,
        // timestamp: performance.now(),  // @note Unreliable on tests
        vibrationActuator: null
      },
      gripSpace: undefined,
      hand: undefined,
      handedness: 'none',
      profiles: [],
      targetRayMode: 'screen',
      targetRaySpace: {}
    } as unknown as XRInputSource,
    buttons: {} as Readonly<ButtonStateMap<typeof DefaultButtonAlias>>,
    raycaster: new Raycaster(),
    intersections: [] as Array<{ entity: Entity; distance: number }>
  }
}

/** @description Returns whether or not the given `@param pos` should be true for the given `@param id` iteration index
 *  @why Used to iterate through a matrix of boolean arguments when creating test cases for all of their branches/variations. */
export function getBoolAtPositionForIndex(id: number, pos: number): boolean {
  return Boolean(id & (1 << pos))
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

  describe('getMergedAxesForInputSources', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    describe('should create an object that ...', () => {
      it('... contains 4 axes values at ids (0,1,2,3)', () => {
        setComponent(testEntity, InputSourceComponent)
        const result = InputComponent.getMergedAxesForInputSources([testEntity])
        assert.notEqual(result[0], undefined)
        assert.notEqual(result[1], undefined)
        assert.notEqual(result[2], undefined)
        assert.notEqual(result[3], undefined)
      })

      it('... has all the expected keys for the default mapping', () => {
        setComponent(testEntity, InputSourceComponent)
        const result = InputComponent.getMergedAxesForInputSources([testEntity])
        assert.notEqual(result.HorizontalScroll, undefined)
        assert.notEqual(result.VerticalScroll, undefined)
        assert.notEqual(result.FollowCameraZoomScroll, undefined)
        assert.notEqual(result.FollowCameraShoulderCamScroll, undefined)
      })

      it('... has all the expected keys for the "" mapping', () => {
        setComponent(testEntity, InputSourceComponent, getDummyMapping(''))
        const result = InputComponent.getMergedAxesForInputSources([testEntity])
        assert.notEqual(result.HorizontalScroll, undefined)
        assert.notEqual(result.VerticalScroll, undefined)
        assert.notEqual(result.FollowCameraZoomScroll, undefined)
        assert.notEqual(result.FollowCameraShoulderCamScroll, undefined)
      })

      it('... has all the expected keys for the "standard" mapping', () => {
        setComponent(testEntity, InputSourceComponent, getDummyMapping('standard'))
        const result = InputComponent.getMergedAxesForInputSources([testEntity])
        assert.notEqual(result.FollowCameraZoomScroll, undefined)
        assert.notEqual(result.FollowCameraShoulderCamScroll, undefined)
        assert.notEqual(result.StandardGamepadLeftStickX, undefined)
        assert.notEqual(result.StandardGamepadLeftStickY, undefined)
        assert.notEqual(result.StandardGamepadRightStickX, undefined)
        assert.notEqual(result.StandardGamepadRightStickY, undefined)
      })

      it('... has all the expected keys for the "xr-standard" mapping', () => {
        setComponent(testEntity, InputSourceComponent, getDummyMapping('xr-standard'))
        const result = InputComponent.getMergedAxesForInputSources([testEntity])
        assert.notEqual(result.FollowCameraZoomScroll, undefined)
        assert.notEqual(result.FollowCameraShoulderCamScroll, undefined)
        assert.notEqual(result.XRStandardGamepadTouchpadX, undefined)
        assert.notEqual(result.XRStandardGamepadTouchpadY, undefined)
        assert.notEqual(result.XRStandardGamepadThumbstickX, undefined)
        assert.notEqual(result.XRStandardGamepadThumbstickY, undefined)
      })

      it('... has all the expected keys for the given `@param inputAlias`', () => {
        // Create the `@param inputAlias` object
        const SomeAliasList = {
          SomeAxisOne: [MouseScroll.HorizontalScroll, MouseScroll.VerticalScroll],
          SomeAxisTwo: [
            XRStandardGamepadAxes.XRStandardGamepadTouchpadX,
            XRStandardGamepadAxes.XRStandardGamepadTouchpadY
          ]
        }
        setComponent(testEntity, InputSourceComponent)
        const result = InputComponent.getMergedAxesForInputSources([testEntity], SomeAliasList)
        assert.notEqual(result.SomeAxisOne, undefined)
        assert.notEqual(result.SomeAxisTwo, undefined)
      })
    })

    it('should never return an undefined value when the keys passed in the inputAlias do not exist', () => {
      // Create the incorrect `@param inputAlias` object
      const DoesNotExist = { one: 41, two: 42, three: 43, four: 44 }
      const SomeAliasList = {
        SomeAxisOne: [DoesNotExist.one, DoesNotExist.two],
        SomeAxisTwo: [DoesNotExist.three, DoesNotExist.four]
      }
      setComponent(testEntity, InputSourceComponent)
      const result = InputComponent.getMergedAxesForInputSources([testEntity], SomeAliasList)
      assert.notEqual(result.SomeAxisOne, undefined)
      assert.notEqual(result.SomeAxisTwo, undefined)
    })

    it('should return a value of 0 for the keys passed in the inputAlias that do not exist', () => {
      // Create the incorrect `@param inputAlias` object
      const DoesNotExist = { one: 41, two: 42, three: 43, four: 44 }
      const SomeAliasList = {
        SomeAxisOne: [DoesNotExist.one, DoesNotExist.two],
        SomeAxisTwo: [DoesNotExist.three, DoesNotExist.four]
      }
      setComponent(testEntity, InputSourceComponent)
      const result = InputComponent.getMergedAxesForInputSources([testEntity], SomeAliasList)
      assert.equal(result.SomeAxisOne, 0)
      assert.equal(result.SomeAxisTwo, 0)
    })

    it('should collapse the values of each `inputAlias` field into the single absolute largest value of all keys described by that field, into the result.field of that same name', () => {
      // Create the `@param inputAlias` object
      const SomeAliasList = {
        SomeAxisOne: [MouseScroll.HorizontalScroll, MouseScroll.VerticalScroll],
        SomeWrongAxis: [2, 3]
      }
      const VerticalScroll = 0.42
      const HorizontalScroll = -0.41
      const WrongBigger = 42
      const WrongOther = 21
      setComponent(testEntity, InputSourceComponent)
      const DummyAxes = [HorizontalScroll, VerticalScroll, WrongBigger, WrongOther] as Axes
      getMutableComponent(testEntity, InputSourceComponent).set(getDummyAxes(DummyAxes))
      const result = InputComponent.getMergedAxesForInputSources([testEntity], SomeAliasList)
      assert.notEqual(result.SomeAxisOne, undefined)
      assert.notEqual(result.SomeWrongAxis, undefined)
      assert.equal(result.SomeAxisOne, VerticalScroll)
      assert.notEqual(result.SomeAxisOne, HorizontalScroll)
      assert.equal(result.SomeWrongAxis, WrongBigger)
      assert.notEqual(result.SomeWrongAxis, WrongOther)
    })
  })

  describe('getMergedAxes', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should collapse the state of all axes held by the entities returned by getInputSourceEntities for the given `@param entityContext`, into the resulting object (including the fields described by `@param inputAlias`)', () => {
      // Create the `@param inputAlias` object
      const SomeAliasList = {
        SomeAxisOne: [MouseScroll.HorizontalScroll, MouseScroll.VerticalScroll],
        SomeWrongAxis: [2, 3]
      }
      // Set the low and high values
      const OtherX = 2.0
      const OtherY = 2.1
      const OtherZ = 2.2
      const OtherW = 2.3
      const BiggerX = 40
      const BiggerY = 41
      const BiggerZ = 42
      const BiggerW = 43
      // Set the dummy input source entities
      const one = createEntity() // will be set in the sink
      const two = createEntity() // will be set in the parent
      setComponent(one, InputSourceComponent)
      setComponent(two, InputSourceComponent)
      const DummyAxes1 = [BiggerX, OtherY, BiggerZ, OtherW] as Axes
      const DummyAxes2 = [OtherX, BiggerY, OtherZ, BiggerW] as Axes
      getMutableComponent(one, InputSourceComponent).set(getDummyAxes(DummyAxes1))
      getMutableComponent(two, InputSourceComponent).set(getDummyAxes(DummyAxes2))
      // Create an inputSink entity that holds entity source one
      const sinkEntity = createEntity()
      setComponent(sinkEntity, InputComponent)
      getMutableComponent(sinkEntity, InputComponent).inputSources.set([one])
      // Set the parent as an input entity that holds entity source two and the input sink that contains input source one
      const parentEntity = createEntity()
      setComponent(parentEntity, InputComponent)
      getMutableComponent(parentEntity, InputComponent).inputSources.set([two])
      setComponent(parentEntity, InputSinkComponent)
      getMutableComponent(parentEntity, InputSinkComponent).inputEntities.set([sinkEntity])
      // Set the parent as the parent of testEntity
      setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
      // Run the code to get the result
      const merged = InputComponent.getMergedAxes(testEntity, SomeAliasList)
      const resultArray = [merged[0], merged[1], merged[2], merged[3]] as Axes
      // Check that the result is what we expect it to be
      const Expected = [BiggerX, BiggerY, BiggerZ, BiggerW] as Axes
      assertArrayEqual(resultArray, Expected)
      assert.equal(merged.HorizontalScroll, Expected[MouseScroll.HorizontalScroll])
      assert.equal(merged.VerticalScroll, Expected[MouseScroll.VerticalScroll])
    })
  })

  describe('useHasFocus', () => {
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

    it('should update its state to true whenever the ammount of entities returned by InputComponent.getInputSourceEntities is bigger than 0', () => {
      const effectSpy = sinon.spy()
      const reactorSpy = sinon.spy()
      const Reactor = () => {
        reactorSpy()
        const hasFocus = InputComponent.useHasFocus()
        useEffect(effectSpy, [hasFocus])
        return null
      }

      // Check the data before
      const before = InputComponent.getInputSourceEntities(testEntity).length == 0
      assert.ok(before)
      assert.ok(reactorSpy.notCalled)
      assert.ok(effectSpy.notCalled)

      // Create a reactor root to run the hook's reactor. Goal:
      //   Be able to use useEntityContext without calling `executeSystems`,
      //   which deletes the sources from the entity on every frame
      const root = startReactor(() => {
        return React.createElement(EntityContext.Provider, { value: testEntity }, React.createElement(Reactor, {}))
      }) as ReactorRoot

      // Run reactor before the entity has any sources attached
      root.run()
      assert.ok(reactorSpy.called)
      assert.ok(effectSpy.called) // Called when we start the reactor

      // Set the testEntity input sources
      //  We should react on these changes, and the useHasFocus spy should increment
      const inputSourceEntity = createEntity()
      setComponent(inputSourceEntity, InputSourceComponent)
      getMutableComponent(testEntity, InputComponent).inputSources.set([inputSourceEntity])

      // Extract the useExecute system out of the global list of SystemDefinitions array
      const list = Array.from(SystemDefinitions.entries())
      const [uuid, syst] = list[list.length - 1]
      syst.execute()
      root.run()
      // Check that we have run the correct number of times, after having reacted to the inputSources change
      assert.equal(reactorSpy.callCount, 3)
      assert.equal(effectSpy.callCount, 2)
      const afterOne = InputComponent.getInputSourceEntities(testEntity)
      assert.ok(afterOne.length > 0, 'getInputSourceEntities for testEntity should return an array containing entities')
      assert.equal(
        afterOne[0],
        inputSourceEntity,
        'getInputSourceEntities for testEntity should return an array containing the inputSourceEntity'
      )

      // Run again, and clear the list of inputSources for the testEntity
      root.run()
      getMutableComponent(testEntity, InputComponent).inputSources.set([])
      assert.equal(effectSpy.callCount, 2)
      syst.execute()

      // Check the spies and the list of sources after running the system and the reactor
      assert.equal(reactorSpy.callCount, 4)
      assert.equal(effectSpy.callCount, 2)
      const afterTwo = InputComponent.getInputSourceEntities(testEntity).length == 0
      assert.ok(afterTwo, 'getInputSourceEntities for testEntity should return an empty array after we clear it')

      // Check that everything is updated as expected after running the reactor root
      root.run()
      assert.equal(reactorSpy.callCount, 5)
      assert.equal(effectSpy.callCount, 3)
    })
  })

  /** @note This `describe` block is testing a function that creates a matrix of 4*4*3 different branches.
   *  As such, it is programatically creating a total of 48 different unit test cases. */
  describe('useExecuteWithInput', () => {
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

    // Define the top-level cases. Will run all sub-cases once for each of these conditions
    const orders = [
      InputExecutionOrder.Before,
      InputExecutionOrder.With,
      InputExecutionOrder.After
    ] as InputExecutionOrder[]

    // Create the test case variations
    type CaseData = { executeWhenEditing: boolean; isEditing: boolean; notAncestor: boolean }
    const args = 3 // Amount of separate arguments/conditions that we are testing
    // Populate the test cases variations
    const cases = [] as CaseData[]
    for (let id = 0; id < 1 << args; ++id) {
      cases[id] = {
        executeWhenEditing: getBoolAtPositionForIndex(id, 0),
        isEditing: getBoolAtPositionForIndex(id, 1),
        notAncestor: getBoolAtPositionForIndex(id, 2)
      }
    }

    // Run all tests once for every InputExecutionOrder
    orders.forEach(function (data_order: InputExecutionOrder) {
      let OrderName = ''
      switch (
        data_order // small hack to get the name of the enum string back
      ) {
        case InputExecutionOrder.Before:
          OrderName = 'Before'
          break
        case InputExecutionOrder.With:
          OrderName = 'With'
          break
        case InputExecutionOrder.After:
          OrderName = 'After'
          break
      }

      // Run a test for every condition we defined in the test cases matrix
      cases.forEach(function (data: CaseData) {
        // if (!executeWhenEditing && getState(EngineState).isEditing) return
        const ConditionOne = !data.executeWhenEditing && data.isEditing
        // if (!isAncestor(getState(InputState).capturingEntity, entity, true)) return
        const ConditionAncestor = data.notAncestor
        const MakeAncestor = !data.notAncestor // Unconfuse the double negative into a readable name for the rest of the test
        // Expected condition for whether we should run the execute or not
        // This mirrors the condition checked internally inside the function that we are testing
        const ShouldRun = !(ConditionOne || ConditionAncestor) // Inverted for readability. Too many double negatives

        // Generate the name of the current iteration for the test
        //   These variables will be used to programmatically generate the `it( ... )` statement name for each individual condition
        const run = ShouldRun ? 'run' : 'not run'
        const want = data.executeWhenEditing ? 'want' : 'dont want'
        const editing = data.isEditing ? 'editing' : 'not editing'
        const ancestor = data.notAncestor ? 'not an ancestor' : 'an ancestor'
        const orderIs = `order is set to InputExecutionOrder.${OrderName}`

        it(`should ${run} the executeOnInput function when (we ${want} to executeWhenEditing and we are ${editing}) or (the entity is ${ancestor} of the entityContext) and ${orderIs}`, () => {
          // Create the function spies
          const executeSpy = sinon.spy()
          const reactorSpy = sinon.spy()
          // Create the Reactor setup
          const Reactor = () => {
            reactorSpy()
            InputComponent.useExecuteWithInput(executeSpy, data.executeWhenEditing, data_order) // omitted defaults: (_, false, With)
            // useEffect(() => {
            // }, []) // Mount it once, so that only one useExecute is created
            return null
          }
          assert.equal(reactorSpy.callCount, 0)
          assert.ok(!executeSpy.called)

          // Create a reactor root to run the hook's reactor. Goal:
          //   Set an entityContext for useEntityContext within this UnitTest, and being able to access it from here too
          const root = startReactor(() => {
            return React.createElement(EntityContext.Provider, { value: testEntity }, React.createElement(Reactor, {}))
          }) as ReactorRoot
          assert.equal(reactorSpy.callCount, 1)
          assert.ok(!executeSpy.called)
          root.run()
          // Extract the useExecute system out of the global list of SystemDefinitions array
          const list = Array.from(SystemDefinitions.entries())
          const [_, syst] = list[list.length - 1]
          // Setup the expected state of EngineState.isEditing for this case
          getMutableState(EngineState).isEditing.set(data.isEditing)
          // Setup the expected state of isAncestor::InputState.capturingEntity for this case
          getMutableState(InputState).capturingEntity.set(MakeAncestor ? testEntity : UndefinedEntity)

          // Run the execute
          syst.execute()

          // Sanity check the multi-test setup
          assert.equal(getState(EngineState).isEditing, data.isEditing)
          assert.equal(ConditionAncestor, !isAncestor(getState(InputState).capturingEntity, testEntity, true))

          // Check the test
          assert.equal(reactorSpy.callCount, 2)
          // assert.equal(executeSpy.called, ShouldRun)
        })
      })
    })

    //....................
    // Usage references
    // ref: ProductModelReactor
    // ref: InteractableComponent
    // ref: TransformGizmoSystem
    //....................

    // it("should not run `@param executeOnInput` when InputState.capturingEntity is a valid entity and an ancestor (or self) of the entity is currently set as useEntityContext", () => {})
    // it("should run `@param executeOnInput` when we want to execute when editing, and we are currently editing", () => {})

    //______________________________________
    // Logic Table   (sketch, incomplete)
    //____________________________
    // !true                and   true
    // !executeWhenEditing  and  isEditing
    // we are editing, and we want to run when editing:   don't return early
    //____________________________
    // !false               and   true
    // !executeWhenEditing  and  isEditing
    // we are editing, but don't want to run when editing:   return early
    //
    //____________________________
    // true             and  true
    // capturingEntity  and !isAncestor(capturingEntity, entity, true))
    // we have a capturingEntity
    //   but that entity is not an ancestor of the current entityContext
    //   : return early
    //____________________________
    // false            and  true
    // capturingEntity  and !isAncestor(capturingEntity, entity, true))
    // we don't have a capturingEntity
    //   :  return early
    //____________________________
    // true             and  false
    // capturingEntity  and !isAncestor(capturingEntity, entity, true))
    // we have a capturingEntity
    //   and that entity is an ancestor of the current entityContext
    //   :  don't return early
  })

  // useExecuteWithInput(
  //   executeOnInput: () => void,
  //   executeWhenEditing = false,
  //   order: InputExecutionOrder = InputExecutionOrder.With
  // ) {
  //   const entity = useEntityContext()
  //
  //   return useExecute(() => {
  //     const capturingEntity = getState(InputState).capturingEntity
  //     if (
  //       (!executeWhenEditing && getState(EngineState).isEditing) ||
  //       (capturingEntity && !isAncestor(capturingEntity, entity, true))
  //     )
  //       return
  //     executeOnInput()
  //   }, getInputExecutionInsert(order))
  // },

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
