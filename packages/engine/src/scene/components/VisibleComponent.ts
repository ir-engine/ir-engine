import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent, removeComponent, setComponent } from '../../ecs/functions/ComponentFunctions'

export const VisibleComponent = createMappedComponent<true>('VisibleComponent')

export const SCENE_COMPONENT_VISIBLE = 'visible'

export const setVisibleComponent = (entity: Entity, visible: boolean) => {
  if (visible) setComponent(entity, VisibleComponent, true)
  else removeComponent(entity, VisibleComponent)
}
