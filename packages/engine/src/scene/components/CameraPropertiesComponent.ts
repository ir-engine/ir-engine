import { CameraMode } from '../../camera/types/CameraMode'
import { ProjectionType } from '../../camera/types/ProjectionType'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type RaycastPropsType = {
  enabled: boolean
  rayCount: number
  rayLength: number
  rayFrequency: number
}

export type CameraPropertiesComponentType = {
  projectionType: ProjectionType
  fov: number
  cameraNearClip: number
  cameraFarClip: number
  minCameraDistance: number
  maxCameraDistance: number
  startCameraDistance: number
  cameraMode: CameraMode
  cameraModeDefault: CameraMode
  startInFreeLook: boolean
  minPhi: number
  maxPhi: number
  startPhi: number
  raycastProps: RaycastPropsType
}

// /**@deprecated */
/** @todo deprecate this and move to scene metadata */
export const CameraPropertiesComponent =
  createMappedComponent<CameraPropertiesComponentType>('CameraPropertiesComponent')

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
  cameraFarClip: 10000,
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
