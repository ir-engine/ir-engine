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

export const CameraPropertiesComponent =
  createMappedComponent<CameraPropertiesComponentType>('CameraPropertiesComponent')
