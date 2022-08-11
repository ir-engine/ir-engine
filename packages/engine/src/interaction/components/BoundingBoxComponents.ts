import { Box3 } from 'three'

import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent, setComponent } from '../../ecs/functions/ComponentFunctions'

export type BoundingBoxComponentType = {
  box: Box3
}

export const BoundingBoxComponent = createMappedComponent<BoundingBoxComponentType>('BoundingBoxComponent')
export const BoundingBoxDynamicTag = createMappedComponent<boolean>('BoundingBoxDynamicTag')

export function setBoundingBoxComponent(entity: Entity, box: Box3 = new Box3()) {
  return setComponent(entity, BoundingBoxComponent, { box })
}

export function setBoundingBoxDynamicTag(entity: Entity) {
  return setComponent(entity, BoundingBoxDynamicTag, true)
}
