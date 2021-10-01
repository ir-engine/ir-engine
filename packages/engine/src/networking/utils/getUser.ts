import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Engine } from '../../ecs/classes/Engine'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { AfkCheckComponent } from '../../navigation/component/AfkCheckComponent'
import { UserNameComponent } from '../../scene/components/UserNameComponent'
import { Network } from '../classes/Network'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'

export function getUserEntityByName(name: string) {
  const client = Array.from(Engine.defaultWorld.clients.values()).find((c) => {
    return c.name === name
  })
  return client ? useWorld().getUserAvatarEntity(client.userId) : undefined
}

export function getRemoteUsers(localUserId, notAfk: boolean): UserId[] {
  const world = useWorld()
  const res: UserId[] = []

  for (let [_, client] of world.clients) {
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

  for (let [_, client] of Engine.defaultWorld.clients) {
    if (client.userId === uid) {
      if (client.name !== undefined) {
        return client.name
      } else {
        const unc = getComponent(eid, UserNameComponent)
        if (unc !== undefined) {
          return unc.username
        }
      }
    }
  }

  return ''
}

export function getEid(userId) {
  for (let [_, client] of Engine.defaultWorld.clients) {
    if (client.userId == userId) {
      return useWorld().getUserAvatarEntity(client.userId)
    }
  }

  return undefined
}
