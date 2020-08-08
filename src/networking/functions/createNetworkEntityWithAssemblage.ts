import { World, Entity } from "ecsy"
import { NetworkPrefab } from "../interfaces/NetworkPrefab"
import NetworkObject from "../components/NetworkObject"

export function createNetworkEntityWithPrefab(
  aprefab: NetworkPrefab,
  world: World,
  networkId: string | number,
  addLocalComponents = false
): Entity {
  const entity = world.createEntity()
  entity.addComponent(NetworkObject, { networkId })
  Object.keys(aprefab.components).forEach(value => {
    entity.addComponent(aprefab[value].type)
  })
  if (addLocalComponents)
    Object.keys(aprefab.localComponents).forEach(value => {
      entity.addComponent(aprefab[value].type)
    })
  return entity
}
