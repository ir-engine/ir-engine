import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { ProjectionType } from '../../../camera/types/ProjectionType'
import { CameraMode } from '../../../camera/types/CameraMode'
import { useWorld } from '../../../ecs/functions/SystemHooks'
import { isClient } from '../../../common/functions/isClient'
import { matchActionOnce } from '../../../networking/functions/matchActionOnce'
import { NetworkWorldAction } from '../../../networking/functions/NetworkWorldAction'
import { setCameraProperties } from '../setCameraProperties'
import { CameraPropertiesComponent, CameraPropertiesComponentType } from '../../components/CameraPropertiesComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'

export const SCENE_COMPONENT_CAMERA_PROPERTIES = 'cameraproperties'
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
  startPhi: 10
}

export const deserializeCameraProperties: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<CameraPropertiesComponentType>
): void => {
  addComponent(entity, CameraPropertiesComponent, { ...json.props })
  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_CAMERA_PROPERTIES)

  if (isClient && !Engine.isEditor) {
    matchActionOnce(NetworkWorldAction.spawnAvatar.matches, (spawnAction) => {
      if (spawnAction.$from === Engine.userId) {
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
      startPhi: component.startPhi
    }
  }
}
