import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export const PreventBakeTagComponent = createMappedComponent<true>('PreventBakeTagComponent')

export const SCENE_COMPONENT_PREVENT_BAKE = 'prevent-bake'
