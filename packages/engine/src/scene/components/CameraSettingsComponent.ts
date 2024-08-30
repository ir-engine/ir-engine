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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { useEffect } from 'react'

import { defineComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { CameraSettingsState } from '@ir-engine/spatial/src/camera/CameraSceneMetadata'

export const CameraSettingsComponent = defineComponent({
  name: 'CameraSettingsComponent',
  jsonID: 'EE_camera_settings',

  onInit(entity): typeof CameraSettingsState._TYPE {
    return typeof CameraSettingsState.initial === 'function'
      ? (CameraSettingsState.initial as any)()
      : JSON.parse(JSON.stringify(CameraSettingsState.initial))
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (typeof json.fov === 'number') component.fov.set(json.fov)
    if (typeof json.cameraNearClip === 'number') component.cameraNearClip.set(json.cameraNearClip)
    if (typeof json.cameraFarClip === 'number') component.cameraFarClip.set(json.cameraFarClip)
    if (typeof json.projectionType === 'number') component.projectionType.set(json.projectionType)
    if (typeof json.minCameraDistance === 'number')
      component.minCameraDistance.set(Math.max(json.minCameraDistance, 1.5))
    if (typeof json.maxCameraDistance === 'number') component.maxCameraDistance.set(json.maxCameraDistance)
    if (typeof json.startCameraDistance === 'number') component.startCameraDistance.set(json.startCameraDistance)
    if (typeof json.cameraMode === 'number') component.cameraMode.set(json.cameraMode)
    if (typeof json.cameraModeDefault === 'number') component.cameraModeDefault.set(json.cameraModeDefault)
    if (typeof json.minPhi === 'number') component.minPhi.set(json.minPhi)
    if (typeof json.maxPhi === 'number') component.maxPhi.set(json.maxPhi)
  },

  toJSON: (component) => {
    return {
      fov: component.fov,
      cameraNearClip: component.cameraNearClip,
      cameraFarClip: component.cameraFarClip,
      projectionType: component.projectionType,
      minCameraDistance: component.minCameraDistance,
      maxCameraDistance: component.maxCameraDistance,
      startCameraDistance: component.startCameraDistance,
      cameraMode: component.cameraMode,
      cameraModeDefault: component.cameraModeDefault,
      minPhi: component.minPhi,
      maxPhi: component.maxPhi
    }
  },

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
