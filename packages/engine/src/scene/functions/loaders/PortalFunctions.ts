import { Euler, Quaternion, Vector3 } from 'three'

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
import { addComponent, ComponentType, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { WorldNetworkAction } from '../../../networking/functions/WorldNetworkAction'
import { EngineRenderer } from '../../../renderer/WebGLRendererSystem'
import { CallbackComponent } from '../../components/CallbackComponent'
import {
  PortalComponent,
  PortalComponentType,
  PortalPreviewTypeSimple,
  PortalPreviewTypeSpherical
} from '../../components/PortalComponent'

export const PortalPreviewTypes = new Set<string>()
PortalPreviewTypes.add(PortalPreviewTypeSimple)
PortalPreviewTypes.add(PortalPreviewTypeSpherical)
export const PortalEffects = new Map<string, ComponentType<any>>()
PortalEffects.set('None', null!)

export const SCENE_COMPONENT_PORTAL = 'portal'
export const SCENE_COMPONENT_PORTAL_DEFAULT_VALUES = {
  linkedPortalId: '',
  location: '',
  effectType: 'None',
  previewType: PortalPreviewTypeSimple,
  previewImageURL: '',
  redirect: false,
  spawnPosition: new Vector3(),
  spawnRotation: new Quaternion(),
  remoteSpawnPosition: new Vector3(),
  remoteSpawnRotation: new Quaternion()
} as PortalComponentType

export const deserializePortal: ComponentDeserializeFunction = (entity: Entity, data: PortalComponentType): void => {
  const props = parsePortalProperties(data)

  addComponent(entity, PortalComponent, props)

  addComponent(entity, CallbackComponent, {
    teleport: portalTriggerEnter
  })
}

export const serializePortal: ComponentSerializeFunction = (entity) => {
  const portalComponent = getComponent(entity, PortalComponent)
  if (!portalComponent) return

  return {
    name: SCENE_COMPONENT_PORTAL,
    props: {
      location: portalComponent.location,
      linkedPortalId: portalComponent.linkedPortalId,
      redirect: portalComponent.redirect,
      effectType: portalComponent.effectType,
      previewType: portalComponent.previewType,
      previewImageURL: portalComponent.previewImageURL,
      spawnPosition: portalComponent.spawnPosition,
      spawnRotation: portalComponent.spawnRotation
    }
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
