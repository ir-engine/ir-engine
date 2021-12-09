import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Engine } from '../../ecs/classes/Engine'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { AfkCheckComponent } from '../../navigation/component/AfkCheckComponent'
import { UserNameComponent } from '../../scene/components/UserNameComponent'
import { Network } from '../classes/Network'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'

export function getUserEntityByName(name: string, localUserId) {
  const world = Engine.currentWorld

  for (let [_, client] of world.clients) {
    if (client.userId !== localUserId && client.name === name) {
      return world.getUserAvatarEntity(client.userId)
    }
  }
}

export function getRemoteUsers(localUserId, notAfk: boolean): UserId[] {
  const world = useWorld()
  const res: UserId[] = []

  if (!world) return res
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
  if (!Engine.currentWorld) return ''
  const uid = getComponent(eid, NetworkObjectComponent)?.userId
  if (uid === undefined || uid === '') return ''

  for (let [_, client] of Engine.currentWorld.clients) {
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
  if (!Engine.currentWorld) return undefined
  for (let [_, client] of Engine.currentWorld.clients) {
    if (client.userId == userId) {
      return useWorld().getUserAvatarEntity(client.userId)
    }
  }

  return undefined
}
