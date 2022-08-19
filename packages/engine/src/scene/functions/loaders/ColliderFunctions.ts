import { ComponentDeserializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { Physics } from '../../../physics/classes/Physics'
import { ColliderDescOptions } from '../../../physics/types/PhysicsTypes'
import { Object3DComponent } from '../../components/Object3DComponent'

export const SCENE_COMPONENT_COLLIDER = 'collider'
export const SCENE_COMPONENT_COLLIDER_DEFAULT_VALUES = {}

export const deserializeCollider: ComponentDeserializeFunction = (entity: Entity, data: ColliderDescOptions): void => {
  const object3d = getComponent(entity, Object3DComponent)
  if (object3d)
    Physics.createRigidBodyForObject(
      entity,
      Engine.instance.currentWorld.physicsWorld,
      object3d.value,
      data as ColliderDescOptions
    )
}
