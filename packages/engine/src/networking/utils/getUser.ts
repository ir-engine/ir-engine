import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { AfkCheckComponent } from '../../navigation/component/AfkCheckComponent'
import { Network } from '../classes/Network'

export function getUserId(eid) {
  for (let e in Network.instance.networkObjects) {
    if (Network.instance.networkObjects[e].entity === eid) {
      return Network.instance.networkObjects[e].uniqueId
    }
  }
}
export function getEid(userId) {
  for (let e in Network.instance.networkObjects) {
    if (Network.instance.networkObjects[e].uniqueId === userId) {
      return Network.instance.networkObjects[e].entity
    }
  }
}

//returns the client for a player
export function getPlayer(player) {
  for (let p in Network.instance.clients) {
    if (Network.instance.clients[p].name === player) {
      return Network.instance.clients[p]
    }
  }

  return undefined
}
//returns the entity for a player
export function getPlayerEntity(player): number {
  for (let p in Network.instance.clients) {
    if (Network.instance.clients[p].name === player) {
      for (let e in Network.instance.networkObjects) {
        if (Network.instance.clients[p].userId === Network.instance.networkObjects[e].uniqueId)
          return Network.instance.networkObjects[e].entity
      }
    }
  }

  return undefined
}

export function getPlayers(localUserId, notAfk: boolean): string[] {
  const res: string[] = []

  for (let p in Network.instance.clients) {
    if (
      Network.instance.clients[p].userId !== localUserId &&
      Network.instance.clients[p].name !== undefined &&
      Network.instance.clients[p].name !== '' &&
      !res.includes(Network.instance.clients[p].name)
    ) {
      if (!notAfk) res.push(Network.instance.clients[p].name)
      else {
        const eid = getEid(Network.instance.clients[p].userId)
        if (eid !== undefined) {
          const acc = getComponent(eid, AfkCheckComponent)
          if (acc !== undefined && !acc.isAfk) res.push(Network.instance.clients[p].name)
        }
      }
    }
  }

  return res
}
