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

    const triggerState = Engine.instance.currentWorld.inputState.get(GamepadButtons.RTrigger)
    assert(!triggerState)

    const bumperState = Engine.instance.currentWorld.inputState.get(GamepadButtons.LBumper)!
    assert.equal(bumperState.type, InputType.BUTTON)
    assert.equal(bumperState.value[0], BinaryValue.ON)
    assert.equal(bumperState.lifecycleState, LifecycleValue.Started)

    const axisState = Engine.instance.currentWorld.inputState.get(GamepadAxis.LTouchpad)!
    assert(axisState)
    assert.equal(axisState.type, InputType.TWODIM)
    assert.equal(axisState.value[0], 1)
    assert.equal(axisState.value[1], 0)
    assert.equal(axisState.lifecycleState, LifecycleValue.Started)
  })
})
