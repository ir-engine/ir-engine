import { World, Entity } from "ecsy"
import { NetworkAssemblage } from "../interfaces/NetworkAssemblage"
import NetworkObject from "../components/NetworkObject"

export function createNetworkEntityWithAssemblage(
  assemblage: NetworkAssemblage,
  world: World,
  networkId: string | number,
  addLocalComponents = false
): Entity {
  const entity = world.createEntity()
  entity.addComponent(NetworkObject, { networkId })
  Object.keys(assemblage.components).forEach(value => {
    entity.addComponent(assemblage[value].type)
  })
  if (addLocalComponents)
    Object.keys(assemblage.localComponents).forEach(value => {
      entity.addComponent(assemblage[value].type)
    })
  return entity
}
