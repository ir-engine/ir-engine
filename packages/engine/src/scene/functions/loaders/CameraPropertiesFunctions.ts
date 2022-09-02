import { ComponentDeserializeFunction } from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, setComponent } from '../../../ecs/functions/ComponentFunctions'
import {
  CameraPropertiesComponent,
  CameraPropertiesComponentType,
  SCENE_COMPONENT_CAMERA_PROPERTIES_DEFAULT_VALUES
} from '../../components/CameraPropertiesComponent'
import { setCameraProperties } from '../setCameraProperties'

export const deserializeCameraProperties: ComponentDeserializeFunction = (
  entity: Entity,
  data: CameraPropertiesComponentType
): void => {
  const props = parseCameraPropertiesProperties(data)
  setComponent(entity, CameraPropertiesComponent, props)
}

export const updateCameraProperties = (entity: Entity) => {
  if (isClient && !Engine.instance.isEditor) {
    setCameraProperties(Engine.instance.currentWorld.cameraEntity, getComponent(entity, CameraPropertiesComponent))
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
