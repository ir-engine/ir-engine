import { Group, Object3D } from 'three'

import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent, defineComponent } from '../../ecs/functions/ComponentFunctions'

/** @deprecated */
export type Object3DWithEntity = Object3D & { entity: Entity }

/** @deprecated */
export type Object3DComponentType = {
  value: Object3D | Group
}

/**
 * @deprecated use GroupComponent
 */
export const Object3DComponent = createMappedComponent<Object3DComponentType>('Object3DComponent')
