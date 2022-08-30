import { Box3 } from 'three'

import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent, getComponent, hasComponent, setComponent } from '../../ecs/functions/ComponentFunctions'

export type BoundingBoxComponentType = {
  box: Box3
}

export const BoundingBoxComponent = createMappedComponent<BoundingBoxComponentType>('BoundingBoxComponent')
export const BoundingBoxDynamicTag = createMappedComponent<boolean>('BoundingBoxDynamicTag')

export function setBoundingBoxComponent(entity: Entity) {
  if (hasComponent(entity, BoundingBoxComponent)) return getComponent(entity, BoundingBoxComponent)
  return setComponent(entity, BoundingBoxComponent, { box: new Box3() })
}

export function setBoundingBoxDynamicTag(entity: Entity) {
  return setComponent(entity, BoundingBoxDynamicTag, true)
}
