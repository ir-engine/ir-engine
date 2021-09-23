import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { AfkCheckComponent } from '../../navigation/component/AfkCheckComponent'
import { Network } from '../classes/Network'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'

export function getUserEntityByName(name: string) {
  const client = Array.from(Network.instance.clients.values()).find((c) => {
    return c.name === name
  })
  return client ? useWorld().getUserAvatarEntity(client.userId) : undefined
}

export function getRemoteUsers(localUserId, notAfk: boolean): UserId[] {
  const world = useWorld()
  const res: UserId[] = []

  for (let [_, client] of Network.instance.clients) {
    if (client.userId !== localUserId) {
      if (!notAfk) res.push(client.userId)
      else {
        const eid = world.getUserAvatarEntity(client.userId)
        if (eid !== undefined) {
          const acc = getComponent(eid, AfkCheckComponent)
          if (acc !== undefined && !acc.isAfk) res.push(client.userId)
        }
      }
    }
  }

  return res
}

export function getPlayerName(eid): string {
  const uid = getComponent(eid, NetworkObjectComponent)?.userId
  if (uid === undefined || uid === '') return ''

  for (let p in Network.instance.clients) {
    if (Network.instance.clients[p].userId === uid) {
      return Network.instance.clients[p].name
    }
  }

  return ''
}
