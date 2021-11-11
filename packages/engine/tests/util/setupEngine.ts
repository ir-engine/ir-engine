import { EngineSystemPresets, InitializeOptions } from '../../src/initializationOptions'
import { Network } from '../../src/networking/classes/Network'
import '@xrengine/engine/src/patchEngineNode'

class DummyTransport {
  handleKick = () => {}
  initialize = () => {}
  sendData = () => {}
  sendReliableData = () => {}
  sendActions = () => {}
  close = () => {}
}

Network.instance.transport = new DummyTransport()
Network.instance.transport.initialize()

export const engineTestSetup: InitializeOptions = {
  type: EngineSystemPresets.SERVER,
  publicPath: '',
  systems: []
}
