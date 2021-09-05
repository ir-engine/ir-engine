import { Network } from '../classes/Network'

export function getUserId(eid) {
  for (let e in Network.instance.networkObjects) {
    if (Network.instance.networkObjects[e].entity === eid) {
      return Network.instance.networkObjects[e].uniqueId
    }
  }
}

//returns the client for a player
export function getPlayer(player) {
  for (var p in Network.instance.clients) {
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

export function getPlayers(userId): string[] {
  const res: string[] = []

  for (let p in Network.instance.clients) {
    if (
      Network.instance.clients[p].userId !== userId &&
      Network.instance.clients[p].name !== undefined &&
      Network.instance.clients[p].name !== '' &&
      !res.includes(Network.instance.clients[p].name)
    ) {
      res.push(Network.instance.clients[p].name)
    }
  }

  return res
}
