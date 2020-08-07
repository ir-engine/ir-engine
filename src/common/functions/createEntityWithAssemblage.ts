import { World, Entity } from "ecsy"
import { Assemblage } from "../interfaces/Assemblage"

export function createEntityWithAssemblage(assemblage: Assemblage, world: World): Entity {
  const entity = world.createEntity()
  Object.keys(assemblage.components).forEach(value => {
    entity.addComponent(assemblage[value].type, assemblage[value].data)
  })
  return entity
}
