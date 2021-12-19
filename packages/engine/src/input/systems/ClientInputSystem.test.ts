import { strictEqual } from 'assert'
import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { NumericalType } from '../../common/types/NumericalTypes'
import { Engine } from '../../ecs/classes/Engine'
import { createWorld } from '../../ecs/classes/World'
import { GamepadAxis } from '../enums/InputEnums'
import { InputType } from '../enums/InputType'
import { InputValue } from '../interfaces/InputValue'
import { InputAlias } from '../types/InputAlias'
import ClientInputSystem, { enableInput } from './ClientInputSystem'

describe('clientInputSystem', () => {
  let world
  let clientInputSystem
  const GAMEPAD_STICK = GamepadAxis.Left
  const GAMEPAD_STICKR = GamepadAxis.Right
  const stickPosition: NumericalType = [0, 0, 0]

  before(async () => {
    world = createWorld()
    Engine.currentWorld = world
    clientInputSystem = await ClientInputSystem(world)
  })
    
  it('check if enable input works', () => {
      enableInput({ keyboard: true, mouse: true })

      strictEqual(Engine.keyboardInputEnabled, true)
      strictEqual(Engine.mouseInputEnabled, true)
  })

  it('add new input - Started state', async() => {
    Engine.inputState.set(GAMEPAD_STICK, {
        type: InputType.TWODIM,
        value: stickPosition,
        lifecycleState: LifecycleValue.Started
      })

      strictEqual(Engine.inputState.size, 1)
      clientInputSystem()
      strictEqual(Engine.inputState.size, 1)
  })

  it('add new input - Ended state', async() => {
    Engine.inputState.set(GAMEPAD_STICKR, {
      type: InputType.TWODIM,
      value: stickPosition,
      lifecycleState: LifecycleValue.Ended
    })

    strictEqual(Engine.inputState.size, 2)
    strictEqual(Engine.inputState.get(GAMEPAD_STICK)?.lifecycleState, LifecycleValue.Started)
    strictEqual(Engine.inputState.get(GAMEPAD_STICKR)?.lifecycleState, LifecycleValue.Ended)
  })

  it('run the input cycle', async() => {
    clientInputSystem()
    strictEqual(Engine.inputState.get(GAMEPAD_STICK)?.lifecycleState, LifecycleValue.Unchanged)
    strictEqual(Engine.inputState.size, 2)
    clientInputSystem()
    strictEqual(Engine.inputState.size, 1)
  })

  it('set the first input into ended', async() => {
    Engine.inputState.set(GAMEPAD_STICK, {
      type: InputType.TWODIM,
      value: stickPosition,
      lifecycleState: LifecycleValue.Ended
    })
    clientInputSystem()
    strictEqual(Engine.inputState.size, 1)
    strictEqual(Engine.inputState.get(GAMEPAD_STICK)?.lifecycleState, LifecycleValue.Ended)
    clientInputSystem()
    strictEqual(Engine.inputState.size, 0)
  })
})