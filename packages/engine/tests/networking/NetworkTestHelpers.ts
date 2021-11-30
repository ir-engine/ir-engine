import { useEngine } from '../../src/ecs/classes/Engine'
import { applyDelayedActions, applyIncomingActions } from '../../src/networking/systems/IncomingNetworkSystem'
import { rerouteActions } from '../../src/networking/systems/OutgoingNetworkSystem'

export const mockProgressWorldForNetworkActions = () => {
  // outgoing
  rerouteActions(useEngine().currentWorld!)

  // increment tick
  useEngine().currentWorld!.fixedTick += 2 // TODO: figure out why we need to dispatch two ticks ahead

  // incoming
  applyDelayedActions(useEngine().currentWorld!)
  applyIncomingActions(useEngine().currentWorld!)
}
