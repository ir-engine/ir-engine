import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type ShadowComponentType = {
  cast: boolean
  receive: boolean
}

export const ShadowComponent = createMappedComponent<ShadowComponentType>('ShadowComponent')

export const SCENE_COMPONENT_SHADOW = 'shadow'
export const SCENE_COMPONENT_SHADOW_DEFAULT_VALUES = {
  cast: true,
  receive: true
}
