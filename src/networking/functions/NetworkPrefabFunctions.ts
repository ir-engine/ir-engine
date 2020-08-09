import { Entity, World } from "ecsy"
import { NetworkObject } from "../components/NetworkObject"
import { NetworkPrefab } from "../interfaces/NetworkPrefab"
import { Network } from "../components/Network"

export function createNetworkPrefab(prefab: NetworkPrefab, world: World, networkId: string | number): Entity {
  const entity = world.createEntity()
  entity.addComponent(NetworkObject, { networkId })
  Object.keys(prefab.components).forEach(value => {
    entity.addComponent(prefab[value].type)
  })
  if (networkId === (Network.instance as Network).mySocketID)
    Object.keys(prefab.localComponents).forEach(value => {
      entity.addComponent(prefab[value].type)
    })
  return entity
}
