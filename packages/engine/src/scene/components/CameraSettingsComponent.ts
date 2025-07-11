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

import { useEffect } from 'react'

import { useEntityContext } from '@ir-engine/ecs'
import { defineComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { CameraSettingsState } from '@ir-engine/spatial/src/camera/CameraSettingsState'
import { CameraMode, CameraScrollBehavior, PoiScrollTransition } from '@ir-engine/spatial/src/camera/types/CameraMode'
import { ProjectionType } from '@ir-engine/spatial/src/camera/types/ProjectionType'

export const CameraSettingsComponent = defineComponent({
  name: 'CameraSettingsComponent',
  jsonID: 'EE_camera_settings',

  schema: S.Object({
    cameraNearClip: S.Number({ default: 0.1 }),
    cameraFarClip: S.Number({ default: 1000 }),
    projectionType: S.Enum(ProjectionType, {
      $comment:
        "An indexed enum, ie. the numeric index of a value in the following sequence: 'Orthographic', 'Perspective'",
      default: ProjectionType.Perspective
    }),
    fov: S.Number({ default: 60 }),

    cameraMode: S.Enum(CameraMode, {
      $comment: "An indexed enum, ie. the numeric index of a value in the following sequence: 'FOLLOW', 'GUIDED' ",
      default: CameraMode.FOLLOW,
      deserialize(curr, value) {
        const strValue = value as string
        if (strValue === 'Dynamic') return CameraMode.FOLLOW
        if (strValue === 'POI') return CameraMode.GUIDED

        return value
      }
    }),

    //Fields for FOLLOW camera mode
    minPhi: S.Number({ default: -70 }),
    maxPhi: S.Number({ default: 85 }),

    isAvatarVisible: S.Bool({ default: true }),

    followCameraScrollSensitivity: S.Number({ default: 1 }),

    canCameraFirstPerson: S.Bool({ default: true }),
    canCameraThirdPerson: S.Bool({ default: true }),
    canCameraTopDown: S.Bool({ default: true }),

    isFistPersonFreeCamera: S.Bool({ default: true }),
    isThirdPersonFreeCamera: S.Bool({ default: true }),
    isTopDownFreeCamera: S.Bool({ default: false }),

    firstPersonCameraLimits: S.Number({ default: 360 }),
    thirdPersonCameraLimits: S.Number({ default: 360 }),
    topDownCameraLimits: S.Number({ default: 360 }),

    isFirstPersonCameraReset: S.Bool({ default: true }),
    isThirdPersonCameraReset: S.Bool({ default: true }),
    isTopDownCameraReset: S.Bool({ default: true }),

    thirdPersonMinDistance: S.Number({ default: 1.5 }),
    thirdPersonMaxDistance: S.Number({ default: 50 }),
    thirdPersonDefaultDistance: S.Number({ default: 3 }),

    topDownMinDistance: S.Number({ default: 10 }),
    topDownMaxDistance: S.Number({ default: 70 }),
    topDownDefaultDistance: S.Number({ default: 40 }),

    // Fields for Guided camera mode
    poiEntities: S.Array(S.EntityUUID()),
    poiLerpSpeed: S.Number({ default: 0.5 }),
    scrollDeadzone: S.Number({ default: 1.0 }),
    scrollSensitivity: S.Number({ default: 0.1 }),
    scrollDistancePerPoi: S.Number({ default: 3.0 }),
    scrollBehavior: S.Enum(CameraScrollBehavior, { default: CameraScrollBehavior.Clamp }),
    poiScrollTransitionType: S.Enum(PoiScrollTransition, { default: PoiScrollTransition.Scrolling }),
    enableTransitionButtons: S.Bool({ default: false })
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, CameraSettingsComponent)

    for (const prop of Object.keys(getState(CameraSettingsState))) {
      useEffect(() => {
        if (component[prop].value !== undefined && component[prop].value !== getState(CameraSettingsState)[prop]) {
          if (Array.isArray(component[prop].value)) {
            getMutableState(CameraSettingsState)[prop].set(Array.from(component[prop].value))
          } else {
            getMutableState(CameraSettingsState)[prop].set(component[prop].value)
          }
        }
      }, [component[prop].value])
    }

    useEffect(() => {
      if (component.poiScrollTransitionType.value === PoiScrollTransition.Scrolling) {
        component.enableTransitionButtons.set(false)
      }
    }, [component.poiScrollTransitionType])

    return null
  }
})
