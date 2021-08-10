import { Object3D } from 'three'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

/** Component Class for Object3D type from three.js.  */

export type Object3DComponentType = {
  value: Object3D
}

export const Object3DComponent = createMappedComponent<Object3DComponentType>()
