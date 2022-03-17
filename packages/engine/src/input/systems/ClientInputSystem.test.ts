import assert from 'assert'

import { AvatarInputSchema } from '../../avatar/AvatarInputSchema'
import { BinaryValue } from '../../common/enums/BinaryValue'
import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { NumericalType } from '../../common/types/NumericalTypes'
import { Engine } from '../../ecs/classes/Engine'
import { createWorld } from '../../ecs/classes/World'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { InputComponent } from '../components/InputComponent'
import { GamepadAxis } from '../enums/InputEnums'
import { InputType } from '../enums/InputType'
import { InputValue } from '../interfaces/InputValue'
import { InputAlias } from '../types/InputAlias'
import ClientInputSystem, { processCombinationLifecycle, processEngineInputState } from './ClientInputSystem'

const stickPosition: NumericalType = [0, 0, 0]

describe('ClientInputSystem Unit Tests', () => {
  beforeEach(async () => {
    const world = createWorld()
    Engine.currentWorld = world
    Engine.inputState = new Map()
  })

  describe('processEngineInputState', () => {
    it('add new input - Started state', async () => {
      Engine.inputState.set(GamepadAxis.Left, {
        type: InputType.TWODIM,
        value: stickPosition,
        lifecycleState: LifecycleValue.Started
      })

      assert.strictEqual(Engine.inputState.size, 1)
      processEngineInputState()
      assert.strictEqual(Engine.inputState.size, 1)
    })

    it('add new input - Ended state', async () => {
      Engine.inputState.set(GamepadAxis.Right, {
        type: InputType.TWODIM,
        value: stickPosition,
        lifecycleState: LifecycleValue.Ended
      })
      Engine.inputState.set(GamepadAxis.Left, {
        type: InputType.TWODIM,
        value: stickPosition,
        lifecycleState: LifecycleValue.Started
      })

      assert.strictEqual(Engine.inputState.size, 2)
      assert.strictEqual(Engine.inputState.get(GamepadAxis.Left)?.lifecycleState, LifecycleValue.Started)
      assert.strictEqual(Engine.inputState.get(GamepadAxis.Right)?.lifecycleState, LifecycleValue.Ended)
    })

    it('run the input cycle', async () => {
      Engine.inputState.set(GamepadAxis.Right, {
        type: InputType.TWODIM,
        value: stickPosition,
        lifecycleState: LifecycleValue.Ended
      })
      Engine.inputState.set(GamepadAxis.Left, {
        type: InputType.TWODIM,
        value: stickPosition,
        lifecycleState: LifecycleValue.Started
      })

      processEngineInputState()
      assert.strictEqual(Engine.inputState.get(GamepadAxis.Left)?.lifecycleState, LifecycleValue.Unchanged)
      assert.strictEqual(Engine.inputState.size, 2)
      processEngineInputState()
      assert.strictEqual(Engine.inputState.size, 1)
    })

    it('set the first input into ended', async () => {
      Engine.inputState.set(GamepadAxis.Left, {
        type: InputType.TWODIM,
        value: stickPosition,
        lifecycleState: LifecycleValue.Ended
      })
      processEngineInputState()
      assert.strictEqual(Engine.inputState.size, 1)
      assert.strictEqual(Engine.inputState.get(GamepadAxis.Left)?.lifecycleState, LifecycleValue.Ended)
      processEngineInputState()
      assert.strictEqual(Engine.inputState.size, 0)
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

      Engine.inputState.set('KeyV', {
        type: InputType.BUTTON,
        value: [BinaryValue.ON],
        lifecycleState: LifecycleValue.Started
      })
      Engine.inputState.set('KeyA', {
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

      Engine.inputState.set('KeyV', {
        type: InputType.BUTTON,
        value: [BinaryValue.ON],
        lifecycleState: LifecycleValue.Started
      })
      Engine.inputState.set('KeyA', {
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

describe('ClientInputSystem Integration Tests', () => {
  let world
  let clientInputSystem

  beforeEach(async () => {
    world = createWorld()
    Engine.currentWorld = world
    Engine.inputState = new Map()
    clientInputSystem = await ClientInputSystem(world)
  })
  it('add new input - Started state', async () => {
    Engine.inputState.set(GamepadAxis.Left, {
      type: InputType.TWODIM,
      value: stickPosition,
      lifecycleState: LifecycleValue.Started
    })

    assert.strictEqual(Engine.inputState.size, 1)
    clientInputSystem()
    assert.strictEqual(Engine.inputState.size, 1)
  })

  it('add new input - Ended state', async () => {
    Engine.inputState.set(GamepadAxis.Right, {
      type: InputType.TWODIM,
      value: stickPosition,
      lifecycleState: LifecycleValue.Ended
    })
    Engine.inputState.set(GamepadAxis.Left, {
      type: InputType.TWODIM,
      value: stickPosition,
      lifecycleState: LifecycleValue.Started
    })

    assert.strictEqual(Engine.inputState.size, 2)
    assert.strictEqual(Engine.inputState.get(GamepadAxis.Left)?.lifecycleState, LifecycleValue.Started)
    assert.strictEqual(Engine.inputState.get(GamepadAxis.Right)?.lifecycleState, LifecycleValue.Ended)
  })

  it('run the input cycle', async () => {
    Engine.inputState.set(GamepadAxis.Right, {
      type: InputType.TWODIM,
      value: stickPosition,
      lifecycleState: LifecycleValue.Ended
    })
    Engine.inputState.set(GamepadAxis.Left, {
      type: InputType.TWODIM,
      value: stickPosition,
      lifecycleState: LifecycleValue.Started
    })

    clientInputSystem()
    assert.strictEqual(Engine.inputState.get(GamepadAxis.Left)?.lifecycleState, LifecycleValue.Unchanged)
    assert.strictEqual(Engine.inputState.size, 2)
    clientInputSystem()
    assert.strictEqual(Engine.inputState.size, 1)
  })

  it('set the first input into ended', async () => {
    Engine.inputState.set(GamepadAxis.Left, {
      type: InputType.TWODIM,
      value: stickPosition,
      lifecycleState: LifecycleValue.Ended
    })
    clientInputSystem()
    assert.strictEqual(Engine.inputState.size, 1)
    assert.strictEqual(Engine.inputState.get(GamepadAxis.Left)?.lifecycleState, LifecycleValue.Ended)
    clientInputSystem()
    assert.strictEqual(Engine.inputState.size, 0)
  })
})
