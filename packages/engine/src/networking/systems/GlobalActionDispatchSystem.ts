import { isClient } from '../../common/functions/isClient'
import { defineSystem, System } from '../../ecs/bitecs'
import { ECSWorld } from '../../ecs/classes/World'
import { Network } from '../classes/Network'
import { IncomingActionType } from '../interfaces/NetworkTransport'

export const GlobalActionDispatchSystem = async (): Promise<System> => {
  return defineSystem((world: ECSWorld) => {
    if (!isClient) {
      // On server:
      // incoming actions (that haven't been removed) are sent to all clients
      Network.instance.transport.sendActions(Network.instance.incomingActions)
      // outgoing actions are dispatched back to self as incoming actions (handled in next frame)
      const serverActions = Network.instance.outgoingActions as IncomingActionType[]
      for (const a of serverActions) a.senderId = 'server'
      Network.instance.incomingActions = serverActions
      Network.instance.outgoingActions = []
    } else {
      // On client:
      // we only send actions to server (server will send back our action if it's allowed)
      Network.instance.transport.sendActions(Network.instance.outgoingActions)
      Network.instance.incomingActions = []
      Network.instance.outgoingActions = []
    }

    return world
  })
}
