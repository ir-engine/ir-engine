import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export const EquippableComponent = createMappedComponent<true>('EquippableComponent')

export const SCENE_COMPONENT_EQUIPPABLE = 'equippable'
