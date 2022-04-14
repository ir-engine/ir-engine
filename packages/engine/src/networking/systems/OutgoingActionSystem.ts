import ActionFunctions from '@xrengine/hyperflux/functions/ActionFunctions'

import { World } from '../../ecs/classes/World'
import { Network } from '../classes/Network'

const sendOutgoingActions = (world: World) => {
  const transport = Network.instance.transportHandler?.getWorldTransport()
  if (!transport) return

  const { outgoing, outgoingHistory } = world.store.actions

  for (const o of outgoing) console.log('OUTGOING ' + o.type)

  try {
    transport.sendActions(outgoing)
  } catch (e) {
    console.error(e)
  }

  outgoingHistory.push(...outgoing)

  if (world.isHosting) {
    ActionFunctions.loopbackOutgoingActions(world.store)
  }

  outgoing.length = 0

  return world
}

export default async function OutgoingActionSystem(world: World) {
  return () => {
    sendOutgoingActions(world)
  }
}
