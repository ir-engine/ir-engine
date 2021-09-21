import { World } from '../../ecs/classes/World'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { MapComponent } from '../MapComponent'

export default function getStore(entity: Entity, world: World) {
  return getComponent(entity, MapComponent, false, world)
}
