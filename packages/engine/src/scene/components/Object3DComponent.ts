import { Object3D, Group } from 'three'
import { createMappedComponent } from '../../ecs/ComponentFunctions'

/** Component Class for Object3D type from three.js.  */

export type Object3DComponentType = {
  value: Object3D | Group
}

export const Object3DComponent = createMappedComponent<Object3DComponentType>('Object3DComponent')
