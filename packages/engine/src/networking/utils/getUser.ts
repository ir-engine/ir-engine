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
    console.log(JSON.stringify(Network.instance.clients[p]))
    if (Network.instance.clients[p].name === player) {
      for (let e in Network.instance.networkObjects) {
        if (Network.instance.clients[p].userId === Network.instance.networkObjects[e].uniqueId)
          return Network.instance.networkObjects[e].entity
      }
    }
  }

  return undefined
}
