/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { useEffect } from 'react'

import { getMutableState, getState } from '@etherealengine/hyperflux'

import { CameraSettingsState } from '../../camera/CameraSceneMetadata'
import { defineComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'

export const CameraSettingsComponent = defineComponent({
  name: 'CameraSettingsComponent',
  jsonID: 'camera-settings',

  onInit(entity) {
    return JSON.parse(JSON.stringify(getState(CameraSettingsState))) as typeof CameraSettingsState._TYPE
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (typeof json.fov === 'number') component.fov.set(json.fov)
    if (typeof json.cameraNearClip === 'number') component.cameraNearClip.set(json.cameraNearClip)
    if (typeof json.cameraFarClip === 'number') component.cameraFarClip.set(json.cameraFarClip)
    if (typeof json.projectionType === 'number') component.projectionType.set(json.projectionType)
    if (typeof json.minCameraDistance === 'number') component.minCameraDistance.set(json.minCameraDistance)
    if (typeof json.maxCameraDistance === 'number') component.maxCameraDistance.set(json.maxCameraDistance)
    if (typeof json.startCameraDistance === 'number') component.startCameraDistance.set(json.startCameraDistance)
    if (typeof json.cameraMode === 'number') component.cameraMode.set(json.cameraMode)
    if (typeof json.cameraModeDefault === 'number') component.cameraModeDefault.set(json.cameraModeDefault)
    if (typeof json.minPhi === 'number') component.minPhi.set(json.minPhi)
    if (typeof json.maxPhi === 'number') component.maxPhi.set(json.maxPhi)
  },

  toJSON: (entity, component) => {
    return {
      fov: component.fov.value,
      cameraNearClip: component.cameraNearClip.value,
      cameraFarClip: component.cameraFarClip.value,
      projectionType: component.projectionType.value,
      minCameraDistance: component.minCameraDistance.value,
      maxCameraDistance: component.maxCameraDistance.value,
      startCameraDistance: component.startCameraDistance.value,
      cameraMode: component.cameraMode.value,
      cameraModeDefault: component.cameraModeDefault.value,
      minPhi: component.minPhi.value,
      maxPhi: component.maxPhi.value
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
