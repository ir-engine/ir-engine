import { RigidBodyType } from '@dimforge/rapier3d-compat'
import { BoxBufferGeometry, Mesh, MeshBasicMaterial } from 'three'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { Physics } from '../../../physics/classes/Physics'
import { RigidBodyComponent } from '../../../physics/components/RigidBodyComponent'
import { CollisionGroups, DefaultCollisionMask } from '../../../physics/enums/CollisionGroups'
import { ColliderDescOptions } from '../../../physics/types/PhysicsTypes'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { TriggerVolumeComponent, TriggerVolumeComponentType } from '../../components/TriggerVolumeComponent'

export const deserializeTriggerVolume: ComponentDeserializeFunction = (
  entity: Entity,
  data: TriggerVolumeComponentType
): void => {
  const transform = getComponent(entity, TransformComponent)

  const boxMesh = new Mesh(new BoxBufferGeometry(), new MeshBasicMaterial())
  boxMesh.material.visible = false
  boxMesh.userData = {
    type: 'Cuboid',
    bodyType: RigidBodyType.Fixed,
    isTrigger: true,
    collisionLayer: CollisionGroups.Trigger,
    collisionMask: DefaultCollisionMask
  }
  boxMesh.scale.set(transform.scale.x, transform.scale.y, transform.scale.z)
  Physics.createRigidBodyForObject(
    entity,
    Engine.instance.currentWorld.physicsWorld,
    boxMesh,
    boxMesh.userData as ColliderDescOptions
  )

  addComponent(entity, TriggerVolumeComponent, {
    onEnter: data.onEnter,
    onExit: data.onExit,
    target: data.target,
    active: true
  })

  addComponent(entity, Object3DComponent, { value: boxMesh })
}

export const updateTriggerVolume: ComponentUpdateFunction = (entity: Entity, prop: any) => {
  const transform = getComponent(entity, TransformComponent)
  const rigidBody = getComponent(entity, RigidBodyComponent).body
  rigidBody.setTranslation(transform.position, true)
  rigidBody.setRotation(transform.rotation, true)
}

export const serializeTriggerVolume: ComponentSerializeFunction = (entity) => {
  const triggerVolumeComponent = getComponent(entity, TriggerVolumeComponent)
  if (!triggerVolumeComponent) return

  return {
    target: triggerVolumeComponent.target,
    onEnter: triggerVolumeComponent.onEnter,
    onExit: triggerVolumeComponent.onExit
  }
}
