import assert from 'assert'

import { BinaryValue } from '../common/enums/BinaryValue'
import { LifecycleValue } from '../common/enums/LifecycleValue'
import { Engine } from '../ecs/classes/Engine'
import { createEngine } from '../initializeEngine'
import { GamepadAxis, GamepadButtons } from '../input/enums/InputEnums'
import { InputType } from '../input/enums/InputType'
import { updateGamepadInput } from './XRControllerSystem'

describe('XRControllerSystem', () => {
  beforeEach(() => {
    createEngine()
  })

  it('check gamepad values copied into inputState', () => {
    const inputSource = {
      handedness: 'left',
      gamepad: {
        mapping: 'xr-standard',
        buttons: [{ pressed: false }, { pressed: true }],
        axes: [1, 0.04]
      } as any as Gamepad
    } as XRInputSource

    updateGamepadInput(inputSource)

    const lTriggerState = Engine.instance.currentWorld.inputState.get(GamepadButtons.LTrigger)
    assert(!lTriggerState)

    const lBumperState = Engine.instance.currentWorld.inputState.get(GamepadButtons.LBumper)!
    assert.equal(lBumperState.type, InputType.BUTTON)
    assert.equal(lBumperState.value[0], BinaryValue.ON)
    assert.equal(lBumperState.lifecycleState, LifecycleValue.Started)

    const lAxisState = Engine.instance.currentWorld.inputState.get(GamepadAxis.LTouchpad)!
    assert(lAxisState)
    assert.equal(lAxisState.type, InputType.TWODIM)
    assert.equal(lAxisState.value[0], 1)
    assert.equal(lAxisState.value[1], 0)
    assert.equal(lAxisState.lifecycleState, LifecycleValue.Started)
  })
})
