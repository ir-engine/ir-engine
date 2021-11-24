import { Engine } from '../../src/ecs/classes/Engine'
import { applyDelayedActions, applyIncomingActions } from '../../src/networking/systems/IncomingNetworkSystem'
import { rerouteActions } from '../../src/networking/systems/OutgoingNetworkSystem'

export const mockProgressWorldForNetworkActions = () => {
  // outgoing
  rerouteActions(Engine.currentWorld!)

  // increment tick
  Engine.currentWorld!.fixedTick += 2 // TODO: figure out why we need to dispatch two ticks ahead

  // incoming
  applyDelayedActions(Engine.currentWorld!)
  applyIncomingActions(Engine.currentWorld!)
}
