import { Entity } from '../../ecs/classes/Entity'
import { ComponentConstructor, getComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { RaycastComponent } from '../components/RaycastComponent'

export const getRaycasts = (entity: Entity, component: ComponentConstructor<any, any>): Entity => {
  const raycast = getComponent(entity, RaycastComponent)

  const hit = raycast?.raycastQuery?.hits[0]?.body?.userData?.entity
  console.log(hit)
  console.log(component, hasComponent(hit, component))
  if (typeof hit !== 'undefined' && hasComponent(hit, component)) {
    return hit
  }
}
