import { getState } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { NetworkState } from '../NetworkState'

const sendOutgoingActions = () => {
  for (const [instanceId, network] of Object.entries(getState(NetworkState).networks)) {
    try {
      network.sendActions()
    } catch (e) {
      console.error(e)
    }
  }
}

export default function OutgoingActionSystem() {
  const execute = () => {
    sendOutgoingActions()
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
