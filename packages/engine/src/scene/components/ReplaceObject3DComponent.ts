import { Object3D, Group } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type ReplaceObject3DComponentType = {
  replacement: Object3D | Group
}

export const ReplaceObject3DComponent = createMappedComponent<ReplaceObject3DComponentType>('ReplaceObject3DComponent')
