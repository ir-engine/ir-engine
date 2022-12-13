import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'
import { createInitialButtonState } from '../input/InputState'

const ButtonAlias = {
  left: {
    0: 'LeftTrigger',
    1: 'LeftBumper',
    2: 'LeftPad',
    3: 'LeftStick',
    4: 'ButtonX',
    5: 'ButtonY'
  },
  right: {
    0: 'RightTrigger',
    1: 'RightBumper',
    2: 'RightPad',
    3: 'RightStick',
    4: 'ButtonA',
    5: 'ButtonB'
  }
}

export function updateGamepadInput(world: World, source: XRInputSource) {
  if (source.gamepad?.mapping === 'xr-standard') {
    const mapping = ButtonAlias[source.handedness]
    const buttons = source.gamepad?.buttons
    if (buttons) {
      for (let i = 0; i < buttons.length; i++) {
        const buttonMapping = mapping[i]
        const button = buttons[i]
        if (!world.buttons[buttonMapping] && (button.pressed || button.touched)) {
          world.buttons[buttonMapping] = createInitialButtonState(button)
        }
        if (world.buttons[buttonMapping] && (button.pressed || button.touched)) {
          if (!world.buttons[buttonMapping].pressed && button.pressed) world.buttons[buttonMapping].down = true
          world.buttons[buttonMapping].pressed = button.pressed
          world.buttons[buttonMapping].touched = button.touched
          world.buttons[buttonMapping].value = button.value
        } else if (world.buttons[buttonMapping]) {
          world.buttons[buttonMapping].up = true
        }
      }
    }
  }
}

export default async function XRInputSourceSystem(world: World) {
  const targetRaySpace = {} as XRSpace

  const screenInputSource = {
    handedness: 'none',
    targetRayMode: 'screen',
    targetRaySpace,
    gripSpace: undefined,
    gamepad: {
      axes: new Array(2).fill(0),
      buttons: [],
      connected: true,
      hapticActuators: [],
      id: '',
      index: 0,
      mapping: 'xr-standard',
      timestamp: Date.now()
    },
    profiles: [],
    hand: undefined
  }
  const defaultInputSourceArray = [screenInputSource] as XRInputSourceArray

  const execute = () => {
    if (Engine.instance.xrFrame) {
      const session = Engine.instance.xrFrame.session
      for (const source of session.inputSources) updateGamepadInput(world, source)
      world.inputSources = session.inputSources
    } else {
      world.inputSources = defaultInputSourceArray
      const now = Date.now()
      screenInputSource.gamepad.timestamp = now
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
