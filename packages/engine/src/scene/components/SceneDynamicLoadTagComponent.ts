import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type SceneDynamicLoadTagComponentType = {
  distance: number
  // runtime property
  loaded?: boolean
}

export const SceneDynamicLoadTagComponent =
  createMappedComponent<SceneDynamicLoadTagComponentType>('SceneDynamicLoadTagComponent')

export const SCENE_COMPONENT_DYNAMIC_LOAD = 'dynamic-load'
export const SCENE_COMPONENT_DYNAMIC_LOAD_DEFAULT_VALUES = {
  distance: 20
}
