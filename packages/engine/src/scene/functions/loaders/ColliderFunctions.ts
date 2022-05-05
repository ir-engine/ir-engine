import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { ColliderComponent } from '../../../physics/components/ColliderComponent'
import { createColliderForObject3D, ShapeOptions } from '../../../physics/functions/createCollider'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'

export const SCENE_COMPONENT_COLLIDER = 'collider'
export const SCENE_COMPONENT_COLLIDER_DEFAULT_VALUES = {}

export const deserializeCollider: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<ShapeOptions>
): void => {
  createColliderForObject3D(entity, json.props, false)
  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_COLLIDER)
}

export const serializeCollider: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, ColliderComponent)
  if (!component) return

  return {
    name: SCENE_COMPONENT_COLLIDER,
    props: {
      /**
       * TODO: rewrite this when we clean up our physics implementation
       * since this is only ever used from gltf metadata, we dont yet need to support serialisation
       */
    }
  }
}
