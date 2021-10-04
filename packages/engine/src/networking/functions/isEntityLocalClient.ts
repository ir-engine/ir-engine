import { Entity } from '../../ecs/Entity'
import { useWorld } from '../../ecs/SystemHooks'

export const isEntityLocalClient = (entity: Entity) => {
  const world = useWorld()
  return typeof world.localClientEntity !== 'undefined' && world.localClientEntity === entity
}
