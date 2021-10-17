import { Object3D, Group } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

// TOOD: Will act as tag component to indicate the entity has Object3D instance of Three js library
export type Object3DComponentType = {
  value: Object3D | Group,
}

export const Object3DComponent = createMappedComponent<Object3DComponentType>('Object3DComponent')
