import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type SceneDynamicLoadTagComponentType = {
  distance: number
}

export const SceneDynamicLoadTagComponent =
  createMappedComponent<SceneDynamicLoadTagComponentType>('SceneDynamicLoadTagComponent')
