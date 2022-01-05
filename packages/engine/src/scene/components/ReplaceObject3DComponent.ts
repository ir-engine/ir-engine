import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type ReplaceObject3DComponentType = {
  replacement: GLTF
}

export const ReplaceObject3DComponent = createMappedComponent<ReplaceObject3DComponentType>('ReplaceObject3DComponent')
