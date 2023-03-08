import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const PreventBakeTagComponent = defineComponent({ name: 'PreventBakeTagComponent', toJSON: () => true })

export const SCENE_COMPONENT_PREVENT_BAKE = 'prevent-bake'
