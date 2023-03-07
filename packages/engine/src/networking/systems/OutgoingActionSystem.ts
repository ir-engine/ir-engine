import { Engine } from '../../ecs/classes/Engine'

const sendOutgoingActions = () => {
  for (const [instanceId, network] of Engine.instance.networks) {
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
