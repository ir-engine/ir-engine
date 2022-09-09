import { BackSide, Euler, Group, Mesh, MeshBasicMaterial, Quaternion, SphereGeometry, Vector3 } from 'three'

import { dispatchAction, getState } from '@xrengine/hyperflux'

import { AvatarStates } from '../../../avatar/animation/Util'
import { AvatarControllerComponent } from '../../../avatar/components/AvatarControllerComponent'
import { switchCameraMode } from '../../../avatar/functions/switchCameraMode'
import { CameraMode } from '../../../camera/types/CameraMode'
import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../../ecs/classes/EngineState'
import { Entity } from '../../../ecs/classes/Entity'
import { World } from '../../../ecs/classes/World'
import {
  addComponent,
  ComponentType,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '../../../ecs/functions/ComponentFunctions'
import { WorldNetworkAction } from '../../../networking/functions/WorldNetworkAction'
import { EngineRenderer } from '../../../renderer/WebGLRendererSystem'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { CallbackComponent } from '../../components/CallbackComponent'
import { ColliderComponent } from '../../components/ColliderComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import {
  PortalComponent,
  PortalComponentType,
  PortalPreviewTypeSimple,
  PortalPreviewTypeSpherical,
  SCENE_COMPONENT_PORTAL_COLLIDER_VALUES,
  SCENE_COMPONENT_PORTAL_DEFAULT_VALUES
} from '../../components/PortalComponent'

export const PortalPreviewTypes = new Set<string>()
PortalPreviewTypes.add(PortalPreviewTypeSimple)
PortalPreviewTypes.add(PortalPreviewTypeSpherical)

export const PortalEffects = new Map<string, ComponentType<any>>()
PortalEffects.set('None', null!)

export const deserializePortal: ComponentDeserializeFunction = (entity: Entity, data: PortalComponentType): void => {
  const props = parsePortalProperties(data)
  setComponent(entity, PortalComponent, props)
}

export const updatePortal = (entity: Entity) => {
  const portalComponent = getComponent(entity, PortalComponent)

  if (!hasComponent(entity, CallbackComponent))
    addComponent(entity, CallbackComponent, {
      teleport: portalTriggerEnter
    })

  if (!hasComponent(entity, Object3DComponent)) {
    const group = new Group()
    group.scale.setScalar(0.5)
    addComponent(entity, Object3DComponent, { value: group })
    if (!hasComponent(entity, ColliderComponent))
      addComponent(entity, ColliderComponent, { ...SCENE_COMPONENT_PORTAL_COLLIDER_VALUES })
  }

  const group = getComponent(entity, Object3DComponent).value

  if (group.children.length && portalComponent.previewType === PortalPreviewTypeSimple) {
    group.children[0].removeFromParent()
    removeComponent(entity, Object3DComponent)
  }

  if (!group.children.length && portalComponent.previewType === PortalPreviewTypeSpherical) {
    const transform = getComponent(entity, TransformComponent)
    const portalMesh = new Mesh(new SphereGeometry(1.5, 32, 32), new MeshBasicMaterial({ side: BackSide }))
    portalMesh.scale.x = -1
    portalMesh.scale.x *= 1 / transform.scale.x
    portalMesh.scale.y *= 1 / transform.scale.y
    portalMesh.scale.z *= 1 / transform.scale.z
    group.add(portalMesh)
  }
}

export const serializePortal: ComponentSerializeFunction = (entity) => {
  const portalComponent = getComponent(entity, PortalComponent)
  return {
    location: portalComponent.location,
    linkedPortalId: portalComponent.linkedPortalId,
    redirect: portalComponent.redirect,
    effectType: portalComponent.effectType,
    previewType: portalComponent.previewType,
    previewImageURL: portalComponent.previewImageURL,
    spawnPosition: portalComponent.spawnPosition,
    spawnRotation: new Euler().setFromQuaternion(portalComponent.spawnRotation)
  }
}

const parsePortalProperties = (props): PortalComponentType => {
  return {
    location: props.location ?? SCENE_COMPONENT_PORTAL_DEFAULT_VALUES.location,
    linkedPortalId: props.linkedPortalId ?? SCENE_COMPONENT_PORTAL_DEFAULT_VALUES.linkedPortalId,
    redirect: props.redirect ?? false,
    effectType: props.effectType ?? 'None',
    previewType: props.previewType ?? PortalPreviewTypeSimple,
    previewImageURL: props.previewImageURL ?? '',
    spawnPosition: new Vector3().copy(props.spawnPosition),
    spawnRotation: new Quaternion().setFromEuler(new Euler().setFromVector3(props.spawnRotation)),
    remoteSpawnPosition: new Vector3(),
    remoteSpawnRotation: new Quaternion()
  }
}

export const setAvatarToLocationTeleportingState = (world: World) => {
  if (!EngineRenderer.instance.xrSession)
    switchCameraMode(Engine.instance.currentWorld.cameraEntity, { cameraMode: CameraMode.ShoulderCam })
  getComponent(world.localClientEntity, AvatarControllerComponent).movementEnabled = false
  dispatchAction(WorldNetworkAction.avatarAnimation({ newStateName: AvatarStates.FALL_IDLE, params: {} }))
}

export const revertAvatarToMovingStateFromTeleport = (world: World) => {
  const controller = getComponent(world.localClientEntity, AvatarControllerComponent)
  controller.movementEnabled = true

  // teleport player to where the portal spawn position is
  controller.body.setTranslation(world.activePortal!.remoteSpawnPosition, true)
  controller.body.setRotation(world.activePortal!.remoteSpawnRotation, true)

  world.activePortal = null
  dispatchAction(EngineActions.setTeleporting({ isTeleporting: false, $time: Date.now() + 500 }))
}

export const portalTriggerEnter = (triggerEntity: Entity) => {
  if (!getState(EngineState).isTeleporting.value && getComponent(triggerEntity, PortalComponent)) {
    const portalComponent = getComponent(triggerEntity, PortalComponent)
    Engine.instance.currentWorld.activePortal = portalComponent
    dispatchAction(EngineActions.setTeleporting({ isTeleporting: true }))
    return
  }
}
