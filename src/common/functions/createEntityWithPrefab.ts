import { World, Entity } from "ecsy"
import { Prefab } from "../interfaces/Prefab"

export function createEntityWithPrefab(prefab: Prefab, world: World): Entity {
  const entity = world.createEntity()
  Object.keys(prefab.components).forEach(value => {
    entity.addComponent(prefab[value].type, prefab[value].data)
  })
  prefab.onCreate.forEach(value => {
    value.behavior(entity, value.args)
  })
  return entity
}
