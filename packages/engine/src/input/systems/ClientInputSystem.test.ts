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
import ClientInputSystem, { processCombinationLifecycle, processEngineInputState } from './ClientInputSystem'

const stickPosition: NumericalType = [0, 0, 0]

describe('ClientInputSystem Unit Tests', () => {
  beforeEach(() => {
    createEngine()
  })

  describe('processEngineInputState', () => {
    it('add new input - Started state', () => {
      Engine.instance.currentWorld.inputState.set(GamepadAxis.Left, {
        type: InputType.TWODIM,
        value: stickPosition,
        lifecycleState: LifecycleValue.Started
      })

      assert.strictEqual(Engine.instance.currentWorld.inputState.size, 1)
      processEngineInputState()
      assert.strictEqual(Engine.instance.currentWorld.inputState.size, 1)
    })

    it('add new input - Ended state', () => {
      Engine.instance.currentWorld.inputState.set(GamepadAxis.Right, {
        type: InputType.TWODIM,
        value: stickPosition,
        lifecycleState: LifecycleValue.Ended
      })
      Engine.instance.currentWorld.inputState.set(GamepadAxis.Left, {
        type: InputType.TWODIM,
        value: stickPosition,
        lifecycleState: LifecycleValue.Started
      })

      assert.strictEqual(Engine.instance.currentWorld.inputState.size, 2)
      assert.strictEqual(
        Engine.instance.currentWorld.inputState.get(GamepadAxis.Left)?.lifecycleState,
        LifecycleValue.Started
      )
      assert.strictEqual(
        Engine.instance.currentWorld.inputState.get(GamepadAxis.Right)?.lifecycleState,
        LifecycleValue.Ended
      )
    })

    it('Two similar state becomes unchanged', () => {
      Engine.instance.currentWorld.inputState.set(GamepadAxis.Left, {
        type: InputType.TWODIM,
        value: stickPosition,
        lifecycleState: LifecycleValue.Started
      })

      processEngineInputState()
      assert.strictEqual(
        Engine.instance.currentWorld.inputState.get(GamepadAxis.Left)?.lifecycleState,
        LifecycleValue.Started
      )
      assert.strictEqual(Engine.instance.currentWorld.inputState.size, 1)

      Engine.instance.currentWorld.inputState.set(GamepadAxis.Left, {
        type: InputType.TWODIM,
        value: stickPosition,
        lifecycleState: LifecycleValue.Started
      })
      processEngineInputState()
      assert.strictEqual(
        Engine.instance.currentWorld.inputState.get(GamepadAxis.Left)?.lifecycleState,
        LifecycleValue.Unchanged
      )
      assert.strictEqual(Engine.instance.currentWorld.inputState.size, 1)
    })

    it('set the first input into ended', () => {
      Engine.instance.currentWorld.inputState.set(GamepadAxis.Left, {
        type: InputType.TWODIM,
        value: stickPosition,
        lifecycleState: LifecycleValue.Ended
      })
      processEngineInputState()
      assert.strictEqual(Engine.instance.currentWorld.inputState.size, 1)
      assert.strictEqual(
        Engine.instance.currentWorld.inputState.get(GamepadAxis.Left)?.lifecycleState,
        LifecycleValue.Ended
      )
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
      assert.strictEqual(resultData.lifecycleState, LifecycleValue.Continued)
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
        lifecycleState: LifecycleValue.Continued
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
