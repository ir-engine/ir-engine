import assert from 'assert'

import { AvatarInputSchema } from '../../avatar/AvatarInputSchema'
import { BinaryValue } from '../../common/enums/BinaryValue'
import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { NumericalType } from '../../common/types/NumericalTypes'
import { Engine } from '../../ecs/classes/Engine'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { createEngine } from '../../initializeEngine'
import { InputComponent } from '../components/InputComponent'
import { GamepadAxis } from '../enums/InputEnums'
import { InputType } from '../enums/InputType'
import { InputValue } from '../interfaces/InputValue'
import { InputAlias } from '../types/InputAlias'
import { processCombinationLifecycle, processEngineInputState } from './ClientInputSystem'

describe('ClientInputSystem Unit Tests', () => {
  beforeEach(() => {
    createEngine()
  })

  describe('processEngineInputState', () => {
    it('Started state with non zero values should populate', () => {
      Engine.instance.currentWorld.inputState.set(GamepadAxis.LThumbstick, {
        type: InputType.TWODIM,
        value: [1, 1],
        lifecycleState: LifecycleValue.Started
      })
      processEngineInputState()
      assert.strictEqual(Engine.instance.currentWorld.inputState.size, 1)
    })

    it('Started state with non zero values should not populate', () => {
      Engine.instance.currentWorld.inputState.set(GamepadAxis.LThumbstick, {
        type: InputType.TWODIM,
        value: [0, 0],
        lifecycleState: LifecycleValue.Started
      })
      processEngineInputState()
      assert.strictEqual(Engine.instance.currentWorld.inputState.size, 0)
    })

    it('Started state twice without change should become unchanged', () => {
      Engine.instance.currentWorld.prevInputState.set(GamepadAxis.LThumbstick, {
        type: InputType.TWODIM,
        value: [0.5, 0.5],
        lifecycleState: LifecycleValue.Started
      })
      Engine.instance.currentWorld.inputState.set(GamepadAxis.LThumbstick, {
        type: InputType.TWODIM,
        value: [0.5, 0.5],
        lifecycleState: LifecycleValue.Started
      })
      processEngineInputState()

      assert.strictEqual(
        Engine.instance.currentWorld.prevInputState.get(GamepadAxis.LThumbstick)?.lifecycleState,
        LifecycleValue.Started
      )
      assert.strictEqual(Engine.instance.currentWorld.prevInputState.size, 1)
      assert.strictEqual(
        Engine.instance.currentWorld.inputState.get(GamepadAxis.LThumbstick)?.lifecycleState,
        LifecycleValue.Unchanged
      )
      assert.strictEqual(Engine.instance.currentWorld.inputState.size, 1)
    })

    it('Started state twice with change should become changed', () => {
      Engine.instance.currentWorld.prevInputState.set(GamepadAxis.LThumbstick, {
        type: InputType.TWODIM,
        value: [0.5, 0.5],
        lifecycleState: LifecycleValue.Started
      })
      Engine.instance.currentWorld.inputState.set(GamepadAxis.LThumbstick, {
        type: InputType.TWODIM,
        value: [0.5, 1],
        lifecycleState: LifecycleValue.Started
      })
      processEngineInputState()

      assert.strictEqual(
        Engine.instance.currentWorld.inputState.get(GamepadAxis.LThumbstick)?.lifecycleState,
        LifecycleValue.Changed
      )
      assert.strictEqual(Engine.instance.currentWorld.inputState.size, 1)
    })

    it('Ended state twice with change should remove', () => {
      Engine.instance.currentWorld.prevInputState.set(GamepadAxis.LThumbstick, {
        type: InputType.TWODIM,
        value: [0, 0],
        lifecycleState: LifecycleValue.Ended
      })
      Engine.instance.currentWorld.inputState.set(GamepadAxis.LThumbstick, {
        type: InputType.TWODIM,
        value: [0, 0],
        lifecycleState: LifecycleValue.Ended
      })
      processEngineInputState()

      assert.strictEqual(Engine.instance.currentWorld.inputState.size, 0)
    })
  })

  describe('processCombinationLifecycle', () => {
    it('should start combination', () => {
      const entity = createEntity()
      const inputComponent = addComponent(entity, InputComponent, {
        schema: AvatarInputSchema,
        data: new Map<InputAlias, InputValue>()
      })
      const prevData = new Map<InputAlias, InputValue>()

      const mapping = 'mapping'
      const input = ['KeyV', 'KeyA']

      Engine.instance.currentWorld.inputState.set('KeyV', {
        type: InputType.BUTTON,
        value: [BinaryValue.ON],
        lifecycleState: LifecycleValue.Started
      })
      Engine.instance.currentWorld.inputState.set('KeyA', {
        type: InputType.BUTTON,
        value: [BinaryValue.ON],
        lifecycleState: LifecycleValue.Started
      })

      processCombinationLifecycle(inputComponent, prevData, mapping, input)

      assert(inputComponent.data.has(mapping))
      const resultData = inputComponent.data.get(mapping)!
      assert.strictEqual(resultData.type, InputType.BUTTON)
      assert.strictEqual(resultData.value.length, 1)
      assert.strictEqual(resultData.value[0], BinaryValue.ON)
      assert.strictEqual(resultData.lifecycleState, LifecycleValue.Started)
    })

    it('should continue combination', () => {
      const entity = createEntity()
      const inputComponent = addComponent(entity, InputComponent, {
        schema: AvatarInputSchema,
        data: new Map<InputAlias, InputValue>()
      })
      const prevData = new Map<InputAlias, InputValue>()

      const mapping = 'mapping'
      const input = ['KeyV', 'KeyA']

      Engine.instance.currentWorld.inputState.set('KeyV', {
        type: InputType.BUTTON,
        value: [BinaryValue.ON],
        lifecycleState: LifecycleValue.Started
      })
      Engine.instance.currentWorld.inputState.set('KeyA', {
        type: InputType.BUTTON,
        value: [BinaryValue.ON],
        lifecycleState: LifecycleValue.Started
      })

      prevData.set(mapping, {
        type: InputType.BUTTON,
        value: [BinaryValue.ON],
        lifecycleState: LifecycleValue.Started
      })

      processCombinationLifecycle(inputComponent, prevData, mapping, input)

      assert(inputComponent.data.has(mapping))
      const resultData = inputComponent.data.get(mapping)!
      assert.strictEqual(resultData.type, InputType.BUTTON)
      assert.strictEqual(resultData.value.length, 1)
      assert.strictEqual(resultData.value[0], BinaryValue.ON)
      assert.strictEqual(resultData.lifecycleState, LifecycleValue.Unchanged)
    })

    it('should end combination when previously started', () => {
      const entity = createEntity()
      const inputComponent = addComponent(entity, InputComponent, {
        schema: AvatarInputSchema,
        data: new Map<InputAlias, InputValue>()
      })
      const prevData = new Map<InputAlias, InputValue>()

      const mapping = 'mapping'
      const input = ['KeyV', 'KeyA']

      prevData.set(mapping, {
        type: InputType.BUTTON,
        value: [BinaryValue.ON],
        lifecycleState: LifecycleValue.Started
      })

      processCombinationLifecycle(inputComponent, prevData, mapping, input)

      assert(inputComponent.data.has(mapping))
      const resultData = inputComponent.data.get(mapping)!
      assert.strictEqual(resultData.type, InputType.BUTTON)
      assert.strictEqual(resultData.value.length, 1)
      assert.strictEqual(resultData.value[0], BinaryValue.OFF)
      assert.strictEqual(resultData.lifecycleState, LifecycleValue.Ended)
    })

    it('should end combination when previously continued', () => {
      const entity = createEntity()
      const inputComponent = addComponent(entity, InputComponent, {
        schema: AvatarInputSchema,
        data: new Map<InputAlias, InputValue>()
      })
      const prevData = new Map<InputAlias, InputValue>()

      const mapping = 'mapping'
      const input = ['KeyV', 'KeyA']

      prevData.set(mapping, {
        type: InputType.BUTTON,
        value: [BinaryValue.ON],
        lifecycleState: LifecycleValue.Unchanged
      })

      processCombinationLifecycle(inputComponent, prevData, mapping, input)

      assert(inputComponent.data.has(mapping))
      const resultData = inputComponent.data.get(mapping)!
      assert.strictEqual(resultData.type, InputType.BUTTON)
      assert.strictEqual(resultData.value.length, 1)
      assert.strictEqual(resultData.value[0], BinaryValue.OFF)
      assert.strictEqual(resultData.lifecycleState, LifecycleValue.Ended)
    })

    it('should remove combination when previously ended', () => {
      const entity = createEntity()
      const inputComponent = addComponent(entity, InputComponent, {
        schema: AvatarInputSchema,
        data: new Map<InputAlias, InputValue>()
      })
      const prevData = new Map<InputAlias, InputValue>()

      const mapping = 'mapping'
      const input = ['KeyV', 'KeyA']

      prevData.set(mapping, {
        type: InputType.BUTTON,
        value: [BinaryValue.ON],
        lifecycleState: LifecycleValue.Ended
      })

      processCombinationLifecycle(inputComponent, prevData, mapping, input)

      assert(!inputComponent.data.has(mapping))
    })
  })
})
