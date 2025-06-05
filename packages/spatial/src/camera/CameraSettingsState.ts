/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { defineState } from '@ir-engine/hyperflux'

import { EntityUUID } from '@ir-engine/ecs'

import {
  CameraMode,
  CameraModeType,
  CameraScrollBehavior,
  CameraScrollBehaviorType,
  PoiScrollTransition,
  PoiScrollTransitionType
} from './types/CameraMode'
import { ProjectionType } from './types/ProjectionType'

// TODO: don't mix camera settings and follow camera settings
export const CameraSettingsState = defineState({
  name: 'CameraSettingsState',
  initial: {
    fov: 60,
    cameraNearClip: 0.1,
    cameraFarClip: 1000,
    projectionType: ProjectionType.Perspective,
    minPhi: -70,
    maxPhi: 85,
    cameraMode: CameraMode.FOLLOW as CameraModeType,
    poiEntities: [] as EntityUUID[],
    poiLerpSpeed: 0.5,
    // Manual scroll control properties
    scrollDeadzone: 0.3,
    scrollSensitivity: 2.0,
    scrollDistancePerPoi: 3.0,
    scrollBehavior: CameraScrollBehavior.Clamp as CameraScrollBehaviorType,
    poiScrollTransitionType: PoiScrollTransition.Scrolling as PoiScrollTransitionType,
    enableTransitionButtons: false,

    isAvatarVisible: true,
    followCameraScrollSensitivity: 1,

    canCameraFirstPerson: true,
    canCameraThirdPerson: true,
    canCameraTopDown: true,

    isFistPersonFreeCamera: true,
    isThirdPersonFreeCamera: true,
    isTopDownFreeCamera: false,

    firstPersonCameraLimits: 360,
    thirdPersonCameraLimits: 180,
    topDownCameraLimits: 180,

    isFirstPersonCameraReset: true,
    isThirdPersonCameraReset: true,
    isTopDownCameraReset: true,

    thirdPersonMinDistance: 1.5,
    thirdPersonMaxDistance: 50,
    thirdPersonDefaultDistance: 3,

    topDownMinDistance: 10,
    topDownMaxDistance: 70,
    topDownDefaultDistance: 40
  }
})
