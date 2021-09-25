import { StarterGamePrefabTypes } from '../StarterGameConstants'
import { createMappedComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

export const CubeTagComponent = createMappedComponent('CubeTagComponent')

export const StarterGamePrefabs = {
  [StarterGamePrefabTypes.Cube]: CubeTagComponent
}
