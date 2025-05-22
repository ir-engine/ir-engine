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

import '@ir-engine/hyperflux'
import assert from 'assert'
import React, { useEffect } from 'react'
import sinon from 'sinon'
import { afterEach, beforeEach, describe, it } from 'vitest'

import {
  getComponent,
  getMutableComponent,
  hasComponent,
  serializeComponent,
  setComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'
import { ReactorReconciler, ReactorRoot, getMutableState, getState, startReactor } from '@ir-engine/hyperflux'
import { flushAll } from '@ir-engine/hyperflux/tests/utils/flushAll'

import {
  EngineState,
  Entity,
  EntityContext,
  EntityID,
  EntityTreeComponent,
  InputSystemGroup,
  SystemDefinitions,
  UndefinedEntity,
  createEntity,
  isAncestor
} from '@ir-engine/ecs'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import { vi } from 'vitest'
import { assertArray } from '../../../tests/util/assert'
import { ReferenceSpaceState } from '../../ReferenceSpaceState'
import { initializeSpatialEngine, initializeSpatialViewer } from '../../initializeEngine'
import { HighlightComponent } from '../../renderer/components/HighlightComponent'
import ClientInputFunctions from '../functions/ClientInputFunctions'
import { AnyAxis, KeyboardButton, MouseButton, MouseScroll, createInitialButtonState } from '../state/ButtonState'
import { InputState } from '../state/InputState'
import { InputButtonBindings, InputComponent, InputExecutionOrder, InputExecutionSystemGroup } from './InputComponent'
import { InputSinkComponent } from './InputSinkComponent'
import { InputSourceComponent } from './InputSourceComponent'

/** @description Alias for the type expected by {@link InputSourceComponent.source.gamepad.axes} */
type Axes = [number, number, number, number]

type InputComponentData = {
  inputSinks: EntityID[]
  activationDistance: number
  highlight: boolean
  grow: boolean
  inputSources: Entity[]
}

const InputComponentDefaults: InputComponentData = {
  inputSinks: ['Self'] as EntityID[],
  activationDistance: 2,
  highlight: false,
  grow: false,
  inputSources: [] as Entity[]
}

function assertInputComponentEq(A: InputComponentData, B: InputComponentData): void {
  assertArray.eq(A.inputSinks, B.inputSinks)
  assert.equal(A.activationDistance, B.activationDistance)
  assert.equal(A.highlight, B.highlight)
  assert.equal(A.grow, B.grow)
  assertArray.eq(A.inputSources, B.inputSources)
}

/** @description Returns whether or not the given `@param pos` should be true for the given `@param id` iteration index
 *  @why Used to iterate through a matrix of boolean arguments when creating test cases for all of their branches/variations. */
export function getBoolAtPositionForIndex(id: number, pos: number): boolean {
  return Boolean(id & (1 << pos))
}

describe('InputComponent', () => {
  beforeEach(async () => {
    createEngine()
    initializeSpatialEngine()
    initializeSpatialViewer()
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('IDs', () => {
    it('should initialize the InputComponent.name field with the expected value', () => {
      assert.equal(InputComponent.name, 'InputComponent')
    })
  })

  describe('onInit', () => {
    it('should initialize the component with the expected default values', () => {
      const testEntity = createEntity()
      setComponent(testEntity, InputComponent)
      const data = getComponent(testEntity, InputComponent)
      assertInputComponentEq(data, InputComponentDefaults)
    })
  }) // << onInit

  describe('onSet', () => {
    it('should change the values of an initialized InputComponent', () => {
      const testEntity = createEntity()
      setComponent(testEntity, InputComponent)
      const before = getComponent(testEntity, InputComponent)
      assertInputComponentEq(before, InputComponentDefaults)
      const Expected = {
        inputSinks: ['SomeUUID'] as EntityID[],
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
    it("should serialize the component's default data as expected", () => {
      const testEntity = createEntity()
      setComponent(testEntity, InputComponent)
      const json = serializeComponent(testEntity, InputComponent)
      assert.ok(Array.isArray(json.inputSinks))
      assert.equal(json.inputSinks, 'Self')
      assert.equal(json.activationDistance, 2)
    })
  })

  describe('getInputEntity', () => {
    it('should return UndefinedEntity when the entity does not have an InputComponent or an InputSinkComponent', () => {
      const testEntity = createEntity()
      const result = InputComponent.getInputEntity(testEntity)
      assert.equal(result, UndefinedEntity)
    })

    it('should return the entity itself when the entity has an InputComponent, but no InputSinkComponent', () => {
      const testEntity = createEntity()
      setComponent(testEntity, InputComponent)
      const result = InputComponent.getInputEntity(testEntity)
      assert.equal(result, testEntity)
    })

    it('should return the closest ancestor that has an InputComponent, even if the entity itself has no InputComponent', () => {
      const testEntity = createEntity()
      const parentEntity = createEntity()
      setComponent(parentEntity, InputComponent)
      setComponent(testEntity, EntityTreeComponent, { parentEntity })
      const result = InputComponent.getInputEntity(testEntity)
      assert.equal(result, parentEntity)
    })

    it('should return the entity itself if it has an InputComponent, even if its closest ancestor also has an InputComponent', () => {
      const testEntity = createEntity()
      setComponent(testEntity, InputComponent)
      const parentEntity = createEntity()
      setComponent(parentEntity, InputComponent)
      setComponent(testEntity, EntityTreeComponent, { parentEntity })
      const result = InputComponent.getInputEntity(testEntity)
      assert.equal(result, testEntity)
    })

    it('should return the closest ancestor that has an InputComponent, even if the entity itself has no InputComponent', () => {
      const testEntity = createEntity()
      const parentEntity = createEntity()
      setComponent(parentEntity, InputComponent)
      setComponent(parentEntity, InputSinkComponent)
      setComponent(testEntity, EntityTreeComponent, { parentEntity })
      const result = InputComponent.getInputEntity(testEntity)
      assert.equal(result, parentEntity)
    })

    it('should return the input component via the the closest ancestor InputSinkComponent', () => {
      const testEntity = createEntity()
      const parentEntity = createEntity()
      const inputEntity = createEntity()
      setComponent(inputEntity, InputComponent)
      setComponent(parentEntity, InputSinkComponent, { inputEntity })
      setComponent(testEntity, EntityTreeComponent, { parentEntity })
      const result = InputComponent.getInputEntity(testEntity)
      assert.equal(result, inputEntity)
    })
  })

  describe('getInputSourceEntities', () => {
    it('should return a combined list of all entities contained in the InputComponent.inputSources of the entity returned by InputComponent.getInputEntity(entityContext)', () => {
      const inputEntity = createEntity()
      const testEntity = createEntity()
      const sourceEntity1 = createEntity()
      const sourceEntity2 = createEntity()
      setComponent(sourceEntity1, InputSourceComponent)
      setComponent(sourceEntity2, InputSourceComponent)
      setComponent(inputEntity, InputComponent, { inputSources: [sourceEntity1, sourceEntity2] })
      setComponent(testEntity, EntityTreeComponent, { parentEntity: inputEntity })
      const result = InputComponent.getInputSourceEntities(testEntity)
      assertArray.eq(result, [sourceEntity1, sourceEntity2])
    })
  })

  describe('getButtons', () => {
    it('should return a proxy that checks button states from input sources', () => {
      const Expected = [MouseButton.PrimaryClick, MouseButton.SecondaryClick, MouseButton.AuxiliaryClick]
      const Down = { down: true }
      const NotDown = { down: false }
      const Buttons1 = {}
      const Buttons2 = {}
      const Buttons3 = {}
      // `one`, `two` and `three` are valid entities that have an all-defaults InputComponent
      const one = createEntity()
      const two = createEntity()
      const three = createEntity()
      // Set the state of the buttons
      Buttons1[Expected[0]] = createInitialButtonState(one, { down: true })
      Buttons2[Expected[1]] = createInitialButtonState(two, { down: false })
      Buttons3[Expected[2]] = createInitialButtonState(three, { down: true })
      // We add the key sources to each entity
      setComponent(one, InputSourceComponent)
      setComponent(two, InputSourceComponent)
      setComponent(three, InputSourceComponent)
      getMutableComponent(one, InputSourceComponent).buttons.set(Buttons1)
      getMutableComponent(two, InputSourceComponent).buttons.set(Buttons2)
      getMutableComponent(three, InputSourceComponent).buttons.set(Buttons3)
      // Create the entity that the InputSink will reference
      const inputEntity = createEntity()
      setComponent(inputEntity, InputComponent, { inputSources: [one, two, three] })
      // The parentEntity is the InputSink where we get the inputs from
      const parentEntity = createEntity()
      setComponent(parentEntity, InputSinkComponent, { inputEntity })
      // parentEntity is set as the parent of testEntity
      const testEntity = createEntity()
      setComponent(testEntity, EntityTreeComponent, { parentEntity })
      // The result should contain the buttons listed by all entities combined
      const result = InputComponent.getButtons(testEntity)
      for (const key of Expected) {
        assert.ok(result[key] !== undefined, 'Expected key: ' + key + ' should be contained in the result')
      }
    })

    it('should handle combo button bindings correctly', () => {
      // Create test entity and components
      const testEntity = createEntity()
      setComponent(testEntity, InputSourceComponent)
      setComponent(testEntity, InputComponent, { inputSources: [testEntity] })
      const inputSource = getMutableComponent(testEntity, InputSourceComponent)

      // Create test buttons
      const buttonAlias = {
        SingleButton: [KeyboardButton.KeyA],
        ComboButtons: [[KeyboardButton.KeyA, KeyboardButton.KeyB]]
      } satisfies InputButtonBindings

      // Test case 1: No buttons
      inputSource.buttons.set({})
      let result = InputComponent.getButtons(testEntity, buttonAlias)

      assert.ok(!result.SingleButton)
      assert.ok(!result.ComboButtons)

      // Test case 2: Single button pressed (not consumed)
      ClientInputFunctions.refreshInputs(true)
      inputSource.buttons.set({
        [KeyboardButton.KeyA]: createInitialButtonState(testEntity, {
          pressed: true
        })
      })
      result = InputComponent.getButtons(testEntity, buttonAlias) // this is only necessary for reseting the type inference
      assert.ok(result.SingleButton?.pressed)
      assert.ok(result.SingleButton?.down, 'SingleButton.down should be true')
      assert.ok(!result.ComboButtons)

      // Test case 2b: next input frame, button should not be down
      ClientInputFunctions.refreshInputs(true)
      assert.ok(result.SingleButton?.pressed)
      assert.ok(!result.SingleButton?.down, 'SingleButton.down should be false')
      assert.ok(!result.ComboButtons)

      // Test case 3: Single button touched (should trigger touch state)
      inputSource.buttons.set({
        [KeyboardButton.KeyA]: createInitialButtonState(testEntity, { touched: true })
      })
      ClientInputFunctions.refreshInputs(true)
      assert.ok(result.SingleButton?.touched)
      assert.ok(!result.SingleButton?.down)
      assert.ok(!result.ComboButtons)

      // Test case 4: Partial combo pressed (should not trigger)
      ClientInputFunctions.refreshInputs(true)
      inputSource.buttons.set({
        [KeyboardButton.KeyA]: createInitialButtonState(testEntity, { down: true })
      })
      assert.ok(!result.ComboButtons)
      assert.ok(result.SingleButton?.down)

      // Test case 4b: Partial combo with different button (should not trigger)
      ClientInputFunctions.refreshInputs(true)
      inputSource.buttons.set({
        [KeyboardButton.KeyB]: createInitialButtonState(testEntity, { down: true })
      })
      assert.ok(!result.ComboButtons)
      assert.ok(!result.SingleButton)

      // Test case 5: Full combo pressed - first entity context
      ClientInputFunctions.refreshInputs(true)
      result = InputComponent.getButtons(testEntity, buttonAlias)
      getMutableComponent(testEntity, InputSourceComponent).buttons.set({
        [KeyboardButton.KeyA]: createInitialButtonState(testEntity, { down: true }),
        [KeyboardButton.KeyB]: createInitialButtonState(testEntity, { down: true })
      })
      assert.ok(result.ComboButtons?.down)
      assert.ok(result.ComboButtons?.pressed)
      assert.ok(!result.SingleButton, 'SingleButton should not be available, as it is consumed')
      assert.ok(!result.KeyA, 'KeyA should not be available, as it is consumed')
      assert.ok(!result.KeyB, 'KeyB should not be available, as it is consumed')

      ClientInputFunctions.refreshInputs(true)
      getMutableComponent(testEntity, InputSourceComponent).buttons.set({
        [KeyboardButton.KeyA]: createInitialButtonState(testEntity, { down: true }),
        [KeyboardButton.KeyB]: createInitialButtonState(testEntity, { down: true })
      })
      result = InputComponent.getButtons(testEntity, buttonAlias)
      assert.ok(result.SingleButton?.down)
      assert.ok(!result.KeyA, 'KeyA should not be available, as it is consumed by the alias')
      assert.ok(result.KeyB?.down)
      assert.ok(!result.ComboButtons, 'ComboButtons should not be available, as buttons are consumed')

      // Test case 5b: Different entity context cannot access consumed combo
      const entity2 = createEntity()
      setComponent(entity2, InputComponent, { inputSources: [testEntity] })
      const result2 = InputComponent.getButtons(entity2, buttonAlias)
      assert.equal(
        result2.ComboButtons,
        undefined,
        'Different entity context should not be able to access consumed buttons'
      )

      // Test case 5c: Same entity context can access the combo again after input refresh
      ClientInputFunctions.refreshInputs(true)
      assert.ok(result2.ComboButtons?.pressed)

      // Test case 6: Full combo with mixed states
      ClientInputFunctions.refreshInputs(true)
      result = InputComponent.getButtons(testEntity, buttonAlias)
      getMutableComponent(testEntity, InputSourceComponent).buttons.set({
        [KeyboardButton.KeyA]: createInitialButtonState(testEntity, { down: true, pressed: true }),
        [KeyboardButton.KeyB]: createInitialButtonState(testEntity, { down: true, touched: true })
      })
      assert.ok(result.ComboButtons?.down)
      assert.ok(result.ComboButtons?.pressed)
      assert.ok(result.ComboButtons?.touched)

      // Test case 7: Full combo with dragging/rotating states
      ClientInputFunctions.refreshInputs(true)
      result = InputComponent.getButtons(testEntity, buttonAlias)
      getMutableComponent(testEntity, InputSourceComponent).buttons.set({
        [KeyboardButton.KeyA]: createInitialButtonState(testEntity, { down: true, dragging: true }),
        [KeyboardButton.KeyB]: createInitialButtonState(testEntity, { down: true, rotating: true })
      })
      assert.ok(result.ComboButtons?.down)
      assert.ok(result.ComboButtons?.dragging)
      assert.ok(result.ComboButtons?.rotating)

      // Test case 8: Full combo with different values
      ClientInputFunctions.refreshInputs(true)
      getMutableComponent(testEntity, InputSourceComponent).buttons.set({
        [KeyboardButton.KeyA]: createInitialButtonState(testEntity, { down: true, value: 0.5 }),
        [KeyboardButton.KeyB]: createInitialButtonState(testEntity, { down: true, value: 0.8 })
      })
      assert.ok(result.ComboButtons?.down)
      assert.equal(result.ComboButtons?.value, 0.8, 'Combo should use max value from all buttons')
    })
  })

  describe('getAxes', () => {
    it('should merge axes from input sources', () => {
      // Create test entity and components
      const testEntity = createEntity()
      setComponent(testEntity, InputComponent)
      setComponent(testEntity, InputSourceComponent)

      // Create the `@param inputAlias` object
      const SomeAliasList = {
        SomeAxisOne: [MouseScroll.HorizontalScroll, MouseScroll.VerticalScroll] as AnyAxis[],
        SomeWrongAxis: [10 as AnyAxis]
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

      // Set up input source components
      setComponent(one, InputSourceComponent)
      setComponent(two, InputSourceComponent)
      getMutableComponent(one, InputSourceComponent).source.set({
        handedness: 'none',
        targetRayMode: 'screen',
        gripSpace: undefined,
        gamepad: {
          axes: [BiggerX, OtherY, BiggerZ, OtherW],
          buttons: [],
          connected: true,
          hapticActuators: [],
          id: 'test-gamepad-1',
          index: 0,
          mapping: '' as GamepadMappingType,
          timestamp: performance.now(),
          vibrationActuator: null
        } as unknown as Gamepad,
        profiles: [],
        hand: undefined
      } as unknown as XRInputSource)

      getMutableComponent(two, InputSourceComponent).source.set({
        handedness: 'none',
        targetRayMode: 'screen',
        gripSpace: undefined,
        gamepad: {
          axes: [OtherX, BiggerY, OtherZ, BiggerW],
          buttons: [],
          connected: true,
          hapticActuators: [],
          id: 'test-gamepad-2',
          index: 0,
          mapping: '' as GamepadMappingType,
          timestamp: performance.now(),
          vibrationActuator: null
        } as unknown as Gamepad,
        profiles: [],
        hand: undefined
      } as unknown as XRInputSource)

      const inputEntity = createEntity()
      setComponent(inputEntity, InputComponent, { inputSources: [one, two] })

      // Create an inputSink entity that holds entity source one
      const sinkEntity = createEntity()
      setComponent(sinkEntity, InputSinkComponent)
      getMutableComponent(sinkEntity, InputSinkComponent).inputEntity.set(inputEntity)

      // Set the child entity as a child of the sink
      const childEntity = createEntity()
      setComponent(childEntity, EntityTreeComponent, { parentEntity: sinkEntity })

      // Run the code to get the result
      const merged = InputComponent.getAxes(childEntity, SomeAliasList)
      const resultArray = [merged[0], merged[1], merged[2], merged[3]] as Axes

      // Check that the result is what we expect it to be
      const Expected = [BiggerX, BiggerY, BiggerZ, BiggerW] as Axes
      assertArray.eq(resultArray, Expected)
      assert.equal(merged.HorizontalScroll, Expected[MouseScroll.HorizontalScroll])
      assert.equal(merged.VerticalScroll, Expected[MouseScroll.VerticalScroll])
      assert.equal(merged.SomeAxisOne, BiggerY)
      assert.equal(merged.SomeWrongAxis, 0)
    })
  })

  describe('useHasFocus', () => {
    it('should update its state to true whenever the ammount of entities returned by InputComponent.getInputSourceEntities is bigger than 0', async () => {
      const effectSpy = sinon.spy()
      const reactorSpy = sinon.spy()
      const Reactor = () => {
        reactorSpy()
        const hasFocus = InputComponent.useHasFocus()
        useEffect(effectSpy, [hasFocus])
        return null
      }

      // Check the data before
      const testEntity = createEntity()
      setComponent(testEntity, InputComponent)
      const before = InputComponent.getInputSourceEntities(testEntity).length == 0
      assert.ok(before)
      assert.ok(reactorSpy.notCalled)
      assert.ok(effectSpy.notCalled)

      // Create a reactor root to run the hook's reactor
      const root = startReactor(() => {
        return React.createElement(EntityContext.Provider, { value: testEntity }, React.createElement(Reactor, {}))
      }) as ReactorRoot

      // Run reactor before the entity has any sources attached

      await vi.waitFor(() => {
        assert.ok(reactorSpy.called)
        assert.ok(effectSpy.called) // Called when we start the reactor
      })

      // Set the testEntity input sources
      const inputSourceEntity = createEntity()
      setComponent(inputSourceEntity, InputSourceComponent)
      getMutableComponent(testEntity, InputComponent).inputSources.set([inputSourceEntity])

      // Extract the useExecute system out of the global list
      const list = Array.from(SystemDefinitions.entries())
      const [_, syst] = list[list.length - 1]
      syst.execute()
      root.run()

      await flushAll()

      // Check that we have run the correct number of times
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

      await vi.waitFor(() => {
        assert.equal(effectSpy.callCount, 2)
      })
      getMutableComponent(testEntity, InputComponent).inputSources.set([])
      syst.execute()

      // Check the spies and the list of sources after running the system and the reactor
      assert.equal(reactorSpy.callCount, 3)
      assert.equal(effectSpy.callCount, 2)
      const afterTwo = InputComponent.getInputSourceEntities(testEntity).length == 0
      assert.ok(afterTwo, 'getInputSourceEntities for testEntity should return an empty array after we clear it')

      // Check that everything is updated as expected after running the reactor root

      await vi.waitFor(() => {
        assert.equal(reactorSpy.callCount, 4)
        assert.equal(effectSpy.callCount, 3)
      })
    })
  })

  /** @note This `describe` block is testing a function that creates a matrix of 4*4*3 different branches.
   *  As such, it is programatically creating a total of 48 different unit test cases. */
  describe('useExecuteWithInput', () => {
    // Define the top-level cases
    const orders = [
      InputExecutionOrder.Before,
      InputExecutionOrder.With,
      InputExecutionOrder.After
    ] as InputExecutionOrder[]

    // Create the test case variations
    type CaseData = { executeWhenEditing: boolean; isEditing: boolean; notAncestor: boolean }
    const args = 3 // Amount of separate arguments/conditions that we are testing
    const cases = [] as CaseData[]
    for (let id = 0; id < 1 << args; ++id) {
      cases[id] = {
        executeWhenEditing: getBoolAtPositionForIndex(id, 0),
        isEditing: getBoolAtPositionForIndex(id, 1),
        notAncestor: getBoolAtPositionForIndex(id, 2)
      }
    }

    // Run all tests once for every InputExecutionOrder
    orders.forEach((data_order: InputExecutionOrder) => {
      let OrderName = ''
      switch (data_order) {
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
      cases.forEach((data: CaseData) => {
        const ConditionOne = !data.executeWhenEditing && data.isEditing
        const ConditionAncestor = data.notAncestor
        const MakeAncestor = !data.notAncestor
        const ShouldRun = !(ConditionOne || ConditionAncestor)

        const run = ShouldRun ? 'run' : 'not run'
        const want = data.executeWhenEditing ? 'want' : 'dont want'
        const editing = data.isEditing ? 'editing' : 'not editing'
        const ancestor = data.notAncestor ? 'not an ancestor' : 'an ancestor'
        const orderIs = `order is set to InputExecutionOrder.${OrderName}`

        it(`should ${run} the executeOnInput function when (we ${want} to executeWhenEditing and we are ${editing}) or (the entity is ${ancestor} of the entityContext) and ${orderIs}`, async () => {
          // Create the function spies
          const executeSpy = sinon.spy()
          const reactorSpy = sinon.spy()

          const Reactor = () => {
            reactorSpy()
            InputComponent.useExecuteWithInput(executeSpy, data_order, data.executeWhenEditing)
            return null
          }

          assert.equal(reactorSpy.callCount, 0)
          assert.ok(!executeSpy.called)

          const testEntity = createEntity()
          setComponent(testEntity, InputComponent)
          const root = startReactor(() => {
            return React.createElement(EntityContext.Provider, { value: testEntity }, React.createElement(Reactor, {}))
          }) as ReactorRoot

          await flushAll()

          assert.equal(reactorSpy.callCount, 2)
          assert.ok(!executeSpy.called)
          root.run()

          // Extract the useExecute system out of the global list of SystemDefinitions array
          const list = Array.from(SystemDefinitions.entries())
          const [_, syst] = list[list.length - 1]

          const capturingEntity = MakeAncestor ? testEntity : createEntity()

          getMutableState(EngineState).isEditing.set(data.isEditing)
          getMutableState(InputState).capturingEntity.set(capturingEntity)

          syst.execute()

          assert.equal(getState(EngineState).isEditing, data.isEditing)
          assert.equal(ConditionAncestor, !isAncestor(getState(InputState).capturingEntity, testEntity, true))

          await flushAll()

          assert.equal(reactorSpy.callCount, 3)
          assert.equal(executeSpy.called, ShouldRun)
        })
      })
    })
  })

  describe('reactor', () => {
    it('should add a HighlightComponent to the entity when the InputComponent is set with `highlight: true`', async () => {
      const entity = getState(ReferenceSpaceState).localFloorEntity

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

      await flushAll()

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
