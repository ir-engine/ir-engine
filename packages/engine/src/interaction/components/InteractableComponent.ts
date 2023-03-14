import { Entity } from '../../ecs/classes/Entity'
import { defineComponent, setComponent } from '../../ecs/functions/ComponentFunctions'

export const InteractableComponent = defineComponent({ name: 'InteractableComponent' })

export function setInteractableComponent(entity: Entity) {
  return setComponent(entity, InteractableComponent, true)
}
