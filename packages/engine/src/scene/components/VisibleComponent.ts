import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export const VisibleComponent = createMappedComponent<true>('VisibleComponent')

export const SCENE_COMPONENT_VISIBLE = 'visible'
