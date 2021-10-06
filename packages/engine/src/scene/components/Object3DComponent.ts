import { Object3D, Group } from 'three'
import bitECS from 'bitecs'
import { createMappedComponent, MappedComponent } from '../../ecs/functions/ComponentFunctions'

// TOOD: Will act as tag component to indicate the entity has Object3D instance of Three js library
export type Object3DComponentType = {
  // TODO: Will be removed
  value?: Object3D | Group,

  // TODO: This will hold the type of the component which is holding instance of Obect3d class
  comp: MappedComponent<any, bitECS.ISchema>
}

export const Object3DComponent = createMappedComponent<Object3DComponentType>('Object3DComponent')
