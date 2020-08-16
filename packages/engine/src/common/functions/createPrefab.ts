import { Prefab } from "../interfaces/Prefab"
import { Engine } from "../../ecs/classes/Engine"
import { Entity } from "../../ecs/classes/Entity"
import { createEntity, addComponentToEntity } from "../../ecs/functions/EntityFunctions"

export function createPrefab(prefab: Prefab, world: Engine): Entity {
  const entity = createEntity()
  if (prefab.components)
    Object.keys(prefab.components).forEach(value => {
      addComponentToEntity(entity, prefab[value].type, prefab[value].data)
    })
  prefab.onCreate.forEach(value => {
    value.behavior(entity, value.args)
  })
  return entity
}
