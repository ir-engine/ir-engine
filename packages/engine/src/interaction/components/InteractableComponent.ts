import { Quaternion, Vector3 } from 'three'

import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { setBoundingBoxComponent } from './BoundingBoxComponents'

interface InteractableComponent {
  distance: number
  anchorPosition: Vector3
  anchorRotation: Quaternion
}

export const InteractableComponent = createMappedComponent<InteractableComponent>('InteractableComponent')

export function setInteractableComponent(entity: Entity) {
  setBoundingBoxComponent(entity)
  return setComponent(entity, InteractableComponent, {
    distance: 100,
    anchorPosition: new Vector3(),
    anchorRotation: new Quaternion()
  })
}
