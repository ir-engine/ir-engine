import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'

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
