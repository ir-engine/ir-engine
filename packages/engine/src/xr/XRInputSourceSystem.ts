import { Engine } from '../ecs/classes/Engine'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { ReferenceSpace } from './XRState'

const targetRaySpace = {} as XRSpace

const screenInputSource = {
  handedness: 'none',
  targetRayMode: 'screen',
  get targetRaySpace() {
    if (Engine.instance.xrFrame) {
      return ReferenceSpace.viewer!
    }
    return targetRaySpace
  },
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
const defaultInputSourceArray = [screenInputSource] as XRInputSource[]

const execute = () => {
  const now = Date.now()
  screenInputSource.gamepad.timestamp = now

  if (Engine.instance.xrFrame) {
    const session = Engine.instance.xrFrame.session
    // session.inputSources is undefined when the session is ending, we should probably use xrState.sessionActive instead of Engine.instance.xrFrame
    const inputSources = session.inputSources ? session.inputSources : []
    Engine.instance.inputSources = [...defaultInputSourceArray, ...inputSources]
  } else {
    Engine.instance.inputSources = defaultInputSourceArray
  }
}

export const XRInputSourceSystem = defineSystem({
  uuid: 'ee.engine.XRInputSourceSystem',
  execute
})
