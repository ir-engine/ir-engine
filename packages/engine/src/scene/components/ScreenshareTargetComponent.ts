import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const ScreenshareTargetComponent = defineComponent({ name: 'ScreenshareTargetComponent', toJSON: () => true })

export const SCENE_COMPONENT_SCREENSHARETARGET = 'screensharetarget'
