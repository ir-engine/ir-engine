import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { CameraMode } from './types/CameraMode'
import { ProjectionType } from './types/ProjectionType'

export const DefaultCameraState = {
  fov: 50,
  cameraNearClip: 0.01,
  cameraFarClip: 10000,
  projectionType: ProjectionType.Perspective,
  minCameraDistance: 1,
  maxCameraDistance: 50,
  startCameraDistance: 3,
  cameraMode: CameraMode.Dynamic,
  cameraModeDefault: CameraMode.ThirdPerson,
  minPhi: -70,
  maxPhi: 85,
  startPhi: 10
}

export const CameraSceneMetadataLabel = 'camera'

export const CameraSettingsState = defineState({
  name: 'CameraSettingsState',
  initial: DefaultCameraState
})

export const getCameraSceneMetadataState = () => getMutableState(CameraSettingsState)
