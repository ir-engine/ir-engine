import { Object3D, Group } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type Object3DWithEntity = Object3D & { entity: Entity }
export type GroupWithEntity = Group & { entity: Entity }

/** Component Class for Object3D type from three.js.  */

export type Object3DComponentType = {
  value: Object3D | Group
}

export const Object3DComponent = createMappedComponent<Object3DComponentType>('Object3DComponent')
