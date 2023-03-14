import { Entity } from '../../ecs/classes/Entity'
import { defineComponent, hasComponent, removeComponent, setComponent } from '../../ecs/functions/ComponentFunctions'

export const VisibleComponent = defineComponent({ name: 'VisibleComponent', toJSON: () => true })

export const SCENE_COMPONENT_VISIBLE = 'visible'

export const setVisibleComponent = (entity: Entity, visible: boolean) => {
  if (visible) {
    !hasComponent(entity, VisibleComponent) && setComponent(entity, VisibleComponent, true)
  } else removeComponent(entity, VisibleComponent)
}
