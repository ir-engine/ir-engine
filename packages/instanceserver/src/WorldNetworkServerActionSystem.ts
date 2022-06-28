import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { WorldNetworkAction } from '@xrengine/engine/src/networking/functions/WorldNetworkAction'
import { createActionQueue } from '@xrengine/hyperflux'

import { SocketWebRTCServerNetwork } from './SocketWebRTCServerNetwork'

const receiveSpawnObject = (
  action: typeof WorldNetworkAction.spawnObject.matches._TYPE,
  world = Engine.instance.currentWorld,
  network: SocketWebRTCServerNetwork
) => {
  const user = world.users.get(action.$from)!
  if (!user) return
  if (network.peers.get(action.$from)!.spectating) return

  const app = (world.worldNetwork as SocketWebRTCServerNetwork).app
  app.service('message').create(
    {
      targetObjectId: app.instance.id,
      targetObjectType: 'instance',
      text: `${user.name} joined the layer`,
      isNotification: true
    },
    {
      'identity-provider': {
        userId: action.$from
      }
    }
  )
}

const receiveDestroyObject = (
  action: ReturnType<typeof WorldNetworkAction.destroyObject>,
  world = Engine.instance.currentWorld,
  network: SocketWebRTCServerNetwork
) => {
  const user = world.users.get(action.$from)!
  if (!user) return
  if (network.peers.get(action.$from)!.spectating) return

  const app = (world.worldNetwork as SocketWebRTCServerNetwork).app
  app.service('message').create(
    {
      targetObjectId: app.instance.id,
      targetObjectType: 'instance',
      text: `${user.name} left the layer`,
      isNotification: true
    },
    {
      'identity-provider': {
        userId: action.$from
      }
    }
  )
}

export default async function WorldNetworkServerActionSystem(
  world: World,
  args: { network: SocketWebRTCServerNetwork }
) {
  const spawnObjectQueue = createActionQueue(WorldNetworkAction.spawnObject.matches)
  const destroyObjectQueue = createActionQueue(WorldNetworkAction.destroyObject.matches)

  const network = args.network

  return () => {
    for (const action of spawnObjectQueue()) receiveSpawnObject(action, world, network)
    for (const action of destroyObjectQueue()) receiveDestroyObject(action, world, network)
  }
}
