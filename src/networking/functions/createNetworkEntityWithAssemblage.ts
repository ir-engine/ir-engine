import { Entity, World } from "ecsy"
import { NetworkObject } from "../components/NetworkObject"
import { NetworkPrefab } from "../interfaces/NetworkPrefab"

export function createNetworkEntityWithPrefab(
  prefab: NetworkPrefab,
  world: World,
  networkId: string | number,
  addLocalComponents = false
): Entity {
  const entity = world.createEntity()
  entity.addComponent(NetworkObject, { networkId })
  Object.keys(prefab.components).forEach(value => {
    entity.addComponent(prefab[value].type)
  })
  if (addLocalComponents)
    Object.keys(prefab.localComponents).forEach(value => {
      entity.addComponent(prefab[value].type)
    })
  return entity
}
