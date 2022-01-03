import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { BoxBufferGeometry, Mesh, MeshBasicMaterial, Object3D } from 'three'
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
  const boxMesh = new Mesh(new BoxBufferGeometry(), new MeshBasicMaterial())
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
    boxMesh.material.visible = false
  }

  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_TRIGGER_VOLUME)
}

export const updateTriggerVolume: ComponentUpdateFunction = (entity: Entity, prop: any) => {
  if (Engine.isEditor) {
    const transform = getComponent(entity, TransformComponent)
    const component = getComponent(entity, ColliderComponent)
    const pose = component.body.getGlobalPose()
    pose.translation = transform.position
    pose.rotation = transform.rotation
    component.body.setGlobalPose(pose, false)
    component.body._debugNeedsUpdate = true
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
