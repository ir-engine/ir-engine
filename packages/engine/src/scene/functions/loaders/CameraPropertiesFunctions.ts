import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { CameraMode } from '../../../camera/types/CameraMode'
import { ProjectionType } from '../../../camera/types/ProjectionType'
import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../../ecs/functions/SystemHooks'
import { matchActionOnce } from '../../../networking/functions/matchActionOnce'
import { NetworkWorldAction } from '../../../networking/functions/NetworkWorldAction'
import { CameraPropertiesComponent, CameraPropertiesComponentType } from '../../components/CameraPropertiesComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { setCameraProperties } from '../setCameraProperties'

export const SCENE_COMPONENT_CAMERA_PROPERTIES = 'cameraproperties'

export const RAYCAST_PROPERTIES_DEFAULT_VALUES = {
  enabled: true,
  rayCount: 3,
  rayLength: 15.0,
  rayFrequency: 0.1
}

export const SCENE_COMPONENT_CAMERA_PROPERTIES_DEFAULT_VALUES = {
  fov: 50,
  cameraNearClip: 0.01,
  cameraFarClip: 100,
  projectionType: ProjectionType.Perspective,
  minCameraDistance: 1,
  maxCameraDistance: 50,
  startCameraDistance: 5,
  cameraMode: CameraMode.Dynamic,
  cameraModeDefault: CameraMode.ThirdPerson,
  startInFreeLook: false,
  minPhi: -70,
  maxPhi: 85,
  startPhi: 10,
  raycastProps: {
    enabled: true,
    rayCount: 3,
    rayLength: 15.0,
    rayFrequency: 0.1
  }
}

export const deserializeCameraProperties: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<CameraPropertiesComponentType>
): void => {
  const props = parseCameraPropertiesProperties(json.props)
  addComponent(entity, CameraPropertiesComponent, props)

  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_CAMERA_PROPERTIES)

  if (isClient) {
    matchActionOnce(Engine.instance.currentWorld.store, NetworkWorldAction.spawnAvatar.matches, (spawnAction) => {
      if (spawnAction.$from === Engine.instance.userId) {
        setCameraProperties(useWorld().localClientEntity, json.props)
        return true
      }
      return false
    })
  }
}

export const serializeCameraProperties: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, CameraPropertiesComponent)
  if (!component) return

  return {
    name: SCENE_COMPONENT_CAMERA_PROPERTIES,
    props: {
      fov: component.fov,
      cameraNearClip: component.cameraNearClip,
      cameraFarClip: component.cameraFarClip,
      projectionType: component.projectionType,
      minCameraDistance: component.minCameraDistance,
      maxCameraDistance: component.maxCameraDistance,
      startCameraDistance: component.startCameraDistance,
      cameraMode: component.cameraMode,
      cameraModeDefault: component.cameraModeDefault,
      startInFreeLook: component.startInFreeLook,
      minPhi: component.minPhi,
      maxPhi: component.maxPhi,
      startPhi: component.startPhi,
      raycastProps: component.raycastProps
    }
  }
}

export const parseCameraPropertiesProperties = (props): CameraPropertiesComponentType => {
  return {
    fov: props.fov ?? SCENE_COMPONENT_CAMERA_PROPERTIES_DEFAULT_VALUES.fov,
    cameraNearClip: props.cameraNearClip ?? SCENE_COMPONENT_CAMERA_PROPERTIES_DEFAULT_VALUES.cameraNearClip,
    cameraFarClip: props.cameraFarClip ?? SCENE_COMPONENT_CAMERA_PROPERTIES_DEFAULT_VALUES.cameraFarClip,
    projectionType: props.projectionType ?? SCENE_COMPONENT_CAMERA_PROPERTIES_DEFAULT_VALUES.projectionType,
    minCameraDistance: props.minCameraDistance ?? SCENE_COMPONENT_CAMERA_PROPERTIES_DEFAULT_VALUES.minCameraDistance,
    maxCameraDistance: props.maxCameraDistance ?? SCENE_COMPONENT_CAMERA_PROPERTIES_DEFAULT_VALUES.maxCameraDistance,
    startCameraDistance:
      props.startCameraDistance ?? SCENE_COMPONENT_CAMERA_PROPERTIES_DEFAULT_VALUES.startCameraDistance,
    cameraMode: props.cameraMode ?? SCENE_COMPONENT_CAMERA_PROPERTIES_DEFAULT_VALUES.cameraMode,
    cameraModeDefault: props.cameraModeDefault ?? SCENE_COMPONENT_CAMERA_PROPERTIES_DEFAULT_VALUES.cameraModeDefault,
    startInFreeLook: props.startInFreeLook ?? SCENE_COMPONENT_CAMERA_PROPERTIES_DEFAULT_VALUES.startInFreeLook,
    minPhi: props.minPhi ?? SCENE_COMPONENT_CAMERA_PROPERTIES_DEFAULT_VALUES.minPhi,
    maxPhi: props.maxPhi ?? SCENE_COMPONENT_CAMERA_PROPERTIES_DEFAULT_VALUES.maxPhi,
    startPhi: props.startPhi ?? SCENE_COMPONENT_CAMERA_PROPERTIES_DEFAULT_VALUES.startPhi,
    raycastProps: props.raycastProps ?? SCENE_COMPONENT_CAMERA_PROPERTIES_DEFAULT_VALUES.raycastProps
  }
}
