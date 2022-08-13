import { ConeGeometry, CylinderGeometry, Euler, Mesh, MeshBasicMaterial, Quaternion, Vector3 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { dispatchAction, getState } from '@xrengine/hyperflux'

import { AvatarStates } from '../../../avatar/animation/Util'
import { AvatarControllerComponent } from '../../../avatar/components/AvatarControllerComponent'
import { switchCameraMode } from '../../../avatar/functions/switchCameraMode'
import { CameraMode } from '../../../camera/types/CameraMode'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../../ecs/classes/EngineState'
import { Entity } from '../../../ecs/classes/Entity'
import { World } from '../../../ecs/classes/World'
import { addComponent, ComponentType, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { WorldNetworkAction } from '../../../networking/functions/WorldNetworkAction'
import { EngineRenderer } from '../../../renderer/WebGLRendererSystem'
import { setTransformComponent, TransformComponent } from '../../../transform/components/TransformComponent'
import { CallbackComponent } from '../../components/CallbackComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { NameComponent } from '../../components/NameComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import {
  PortalComponent,
  PortalComponentType,
  PortalPreviewTypeSimple,
  PortalPreviewTypeSpherical
} from '../../components/PortalComponent'
import { VisibleComponent } from '../../components/VisibleComponent'
import { ObjectLayers } from '../../constants/ObjectLayers'
import { setObjectLayers } from '../setObjectLayers'

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
  helper: null!,
  redirect: false,
  spawnPosition: new Vector3(),
  spawnRotation: new Quaternion(),
  remoteSpawnPosition: new Vector3(),
  remoteSpawnRotation: new Quaternion()
} as PortalComponentType

export const deserializePortal: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<PortalComponentType>
): void => {
  const props = parsePortalProperties(json.props)

  const portalComponent = addComponent(entity, PortalComponent, props)

  const spawnHelperEntity = createEntity()
  portalComponent.helper = spawnHelperEntity

  const transform = setTransformComponent(spawnHelperEntity)
  transform.position.copy(props.spawnPosition)
  transform.rotation.copy(props.spawnRotation)
  const spawnHelperMesh = new Mesh(
    new CylinderGeometry(0.25, 0.25, 0.1, 6, 1, false, (30 * Math.PI) / 180),
    new MeshBasicMaterial({ color: 0x2b59c3 })
  )
  const spawnDirection = new Mesh(
    new ConeGeometry(0.05, 0.5, 4, 1, false, Math.PI / 4),
    new MeshBasicMaterial({ color: 0xd36582 })
  )
  spawnDirection.position.set(0, 0, 1.25)
  spawnDirection.rotateX(Math.PI / 2)
  spawnHelperMesh.add(spawnDirection)
  spawnHelperMesh.userData.isHelper = true

  setObjectLayers(spawnHelperMesh, ObjectLayers.NodeHelper)
  addComponent(spawnHelperEntity, Object3DComponent, { value: spawnHelperMesh })
  addComponent(spawnHelperEntity, VisibleComponent, true)
  addComponent(spawnHelperEntity, NameComponent, {
    name: 'portal helper - ' + getComponent(entity, NameComponent).name
  })

  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_PORTAL)
  addComponent(entity, CallbackComponent, {
    teleport: portalTriggerEnter
  })

  updatePortal(entity)
}

export const updatePortal: ComponentUpdateFunction = (entity: Entity) => {
  const portalComponent = getComponent(entity, PortalComponent)
  const helperTransform = getComponent(portalComponent.helper, TransformComponent)
  helperTransform.position.copy(portalComponent.spawnPosition)
  helperTransform.rotation.copy(portalComponent.spawnRotation)
}

export const serializePortal: ComponentSerializeFunction = (entity) => {
  const portalComponent = getComponent(entity, PortalComponent)
  if (!portalComponent) return
  const helperTransform = getComponent(portalComponent.helper, TransformComponent)

  return {
    name: SCENE_COMPONENT_PORTAL,
    props: {
      location: portalComponent.location,
      linkedPortalId: portalComponent.linkedPortalId,
      redirect: portalComponent.redirect,
      effectType: portalComponent.effectType,
      previewType: portalComponent.previewType,
      previewImageURL: portalComponent.previewImageURL,
      spawnPosition: helperTransform.position,
      spawnRotation: helperTransform.rotation
    }
  }
}

const parsePortalProperties = (props): PortalComponentType => {
  return {
    location: props.location ?? SCENE_COMPONENT_PORTAL_DEFAULT_VALUES.location,
    linkedPortalId: props.linkedPortalId ?? SCENE_COMPONENT_PORTAL_DEFAULT_VALUES.linkedPortalId,
    helper: null!,
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
