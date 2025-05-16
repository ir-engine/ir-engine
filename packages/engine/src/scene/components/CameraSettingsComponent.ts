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
import { CameraSettingsState } from '@ir-engine/spatial/src/camera/CameraSceneMetadata'
import { FollowCameraMode } from '@ir-engine/spatial/src/camera/types/FollowCameraMode'
import { ProjectionType } from '@ir-engine/spatial/src/camera/types/ProjectionType'

export const CameraSettingsComponent = defineComponent({
  name: 'CameraSettingsComponent',
  jsonID: 'EE_camera_settings',

  schema: S.Object({
    fov: S.Number({ default: 60 }),
    cameraNearClip: S.Number({ default: 0.1 }),
    cameraFarClip: S.Number({ default: 1000 }),
    projectionType: S.Enum(ProjectionType, {
      $comment:
        "An indexed enum, ie. the numeric index of a value in the following sequence: 'Orthographic', 'Perspective'",
      default: ProjectionType.Perspective
    }),
    minCameraDistance: S.Number({ default: 1.5 }),
    maxCameraDistance: S.Number({ default: 50 }),
    startCameraDistance: S.Number({ default: 3 }),
    cameraMode: S.Enum(FollowCameraMode, {
      $comment:
        "An indexed enum, ie. the numeric index of a value in the following sequence: 'FirstPerson', 'ShoulderCam', 'ThirdPerson', 'TopDown', 'Strategic', 'Dynamic'",
      default: FollowCameraMode.Dynamic
    }),
    cameraModeDefault: S.Enum(FollowCameraMode, {
      $comment:
        "An indexed enum, ie. the numeric index of a value in the following sequence: 'FirstPerson', 'ShoulderCam', 'ThirdPerson', 'TopDown', 'Strategic', 'Dynamic'",
      default: FollowCameraMode.ThirdPerson
    }),
    minPhi: S.Number({ default: -70 }),
    maxPhi: S.Number({ default: 85 })
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, CameraSettingsComponent)

    for (const prop of Object.keys(getState(CameraSettingsState))) {
      useEffect(() => {
        if (component[prop].value !== getState(CameraSettingsState)[prop])
          getMutableState(CameraSettingsState)[prop].set(component[prop].value)
      }, [component[prop]])
    }

    return null
  }
})
