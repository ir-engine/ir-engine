import { Entity } from '../../ecs/classes/Entity'
import { useWorld } from '../../ecs/functions/SystemHooks'

export const isEntityLocalClient = (entity: Entity) => {
  const world = useWorld()
  return world.localClientEntity !== undefined && world.localClientEntity === entity
}
