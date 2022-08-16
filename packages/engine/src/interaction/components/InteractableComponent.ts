import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent, setComponent } from '../../ecs/functions/ComponentFunctions'

export const InteractableComponent = createMappedComponent<boolean>('InteractableComponent')

export function setInteractableComponent(entity: Entity) {
  return setComponent(entity, InteractableComponent, true)
}
