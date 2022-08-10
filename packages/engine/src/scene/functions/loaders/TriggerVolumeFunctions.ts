import { RigidBodyType } from '@dimforge/rapier3d-compat'
import { BoxBufferGeometry, Mesh, MeshBasicMaterial } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

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
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { TriggerVolumeComponent, TriggerVolumeComponentType } from '../../components/TriggerVolumeComponent'

export const SCENE_COMPONENT_TRIGGER_VOLUME = 'trigger-volume'
export const SCENE_COMPONENT_TRIGGER_VOLUME_DEFAULT_VALUES = {}

export const deserializeTriggerVolume: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<TriggerVolumeComponentType>
): void => {
  const transform = getComponent(entity, TransformComponent)

  const boxMesh = new Mesh(new BoxBufferGeometry(), new MeshBasicMaterial())
  boxMesh.material.visible = false
  boxMesh.userData = {
    type: 'Cuboid',
    bodyType: RigidBodyType.Fixed,
    isTrigger: true,
    isHelper: true,
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
    onEnter: json.props.onEnter,
    onExit: json.props.onExit,
    target: json.props.target,
    active: true
  })

  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_TRIGGER_VOLUME)

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
    name: SCENE_COMPONENT_TRIGGER_VOLUME,
    props: {
      target: triggerVolumeComponent.target,
      onEnter: triggerVolumeComponent.onEnter,
      onExit: triggerVolumeComponent.onExit
    }
  }
}
