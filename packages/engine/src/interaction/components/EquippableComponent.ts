import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const EquippableComponent = defineComponent({ name: 'EquippableComponent', toJSON: () => true })

export const SCENE_COMPONENT_EQUIPPABLE = 'equippable'
