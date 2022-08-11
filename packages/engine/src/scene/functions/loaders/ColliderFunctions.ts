import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { Physics } from '../../../physics/classes/Physics'
import { ColliderDescOptions } from '../../../physics/types/PhysicsTypes'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'

export const SCENE_COMPONENT_COLLIDER = 'collider'
export const SCENE_COMPONENT_COLLIDER_DEFAULT_VALUES = {}

export const deserializeCollider: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<ColliderDescOptions>
): void => {
  const object3d = getComponent(entity, Object3DComponent)
  if (object3d)
    Physics.createRigidBodyForObject(
      entity,
      Engine.instance.currentWorld.physicsWorld,
      object3d.value,
      json.props as ColliderDescOptions
    )

  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_COLLIDER)
}

/**
 * since this is only ever used from gltf metadata, we dont yet need to support serialisation
 */
export const serializeCollider: ComponentSerializeFunction = (entity) => {
  return undefined!
}
