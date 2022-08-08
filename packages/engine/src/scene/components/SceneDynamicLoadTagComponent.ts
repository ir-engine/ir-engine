import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type SceneDynamicLoadTagComponentType = {
  distance: 20
}

export const SceneDynamicLoadTagComponent =
  createMappedComponent<SceneDynamicLoadTagComponentType>('SceneDynamicLoadTagComponent')
