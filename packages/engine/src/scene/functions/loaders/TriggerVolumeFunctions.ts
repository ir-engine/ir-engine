import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { BoxBufferGeometry, Mesh, MeshBasicMaterial } from 'three'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../../ecs/functions/SystemHooks'
import { ColliderComponent } from '../../../physics/components/ColliderComponent'
import { CollisionGroups } from '../../../physics/enums/CollisionGroups'
import { createCollider } from '../../../physics/functions/createCollider'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { TriggerVolumeComponent } from '../../components/TriggerVolumeComponent'

export const SCENE_COMPONENT_TRIGGER_VOLUME = 'trigger-volume'
export const SCENE_COMPONENT_TRIGGER_VOLUME_DEFAULT_VALUES = {}

export const deserializeTriggerVolume: ComponentDeserializeFunction = (entity: Entity, json: ComponentJson): void => {
  const transform = getComponent(entity, TransformComponent)
  const pos = transform.position
  const rot = transform.rotation
  const scale = transform.scale

  const boxMesh = new Mesh(
    new BoxBufferGeometry(),
    new MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true })
  )
  boxMesh.position.set(pos.x, pos.y, pos.z)
  boxMesh.scale.set(scale.x, scale.y, scale.z)
  boxMesh.quaternion.set(rot.x, rot.y, rot.z, rot.w)

  boxMesh.userData = {
    type: 'box',
    isTrigger: true,
    collisionLayer: CollisionGroups.Trigger,
    collisionMask: CollisionGroups.Default
  }

  createCollider(entity, boxMesh)

  addComponent(entity, TriggerVolumeComponent, {
    onEnter: json.props.onEnter,
    onExit: json.props.onExit,
    target: json.props.target,
    active: true
  })

  if (Engine.isEditor) {
    addComponent(entity, Object3DComponent, { value: boxMesh })
  }

  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_TRIGGER_VOLUME)
}

export const updateTriggerVolume: ComponentUpdateFunction = (entity: Entity, prop: any) => {
  if (Engine.isEditor) {
    const world = useWorld()
    const transform = getComponent(entity, TransformComponent)
    const body = getComponent(entity, ColliderComponent).body
    const shape = world.physics.getRigidbodyShapes(body)[0]

    const pose = shape.getLocalPose()
    pose.translation = transform.position
    pose.rotation = transform.rotation
    shape.setLocalPose(pose)

    const object3DComponent = getComponent(entity, Object3DComponent)
    object3DComponent.value.position.copy(transform.position)
    object3DComponent.value.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z, 'XYZ')
    object3DComponent.value.scale.copy(transform.scale)
  }
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
