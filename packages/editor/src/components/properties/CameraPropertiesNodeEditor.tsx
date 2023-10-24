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

import { t } from 'i18next'
import React from 'react'

import { CameraMode } from '@etherealengine/engine/src/camera/types/CameraMode'
import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { CameraSettingsComponent } from '@etherealengine/engine/src/scene/components/CameraSettingsComponent'

import { InputGroup } from '../inputs/InputGroup'
import { NumericInputGroup } from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import PropertyGroup from './PropertyGroup'
import { EditorComponentType, commitProperty, updateProperty } from './Util'

/** Types copied from Camera Modes of engine. */
const cameraModeSelect = [
  {
    label: 'First Person',
    value: CameraMode.FirstPerson
  },
  {
    label: 'Shoulder Cam',
    value: CameraMode.ShoulderCam
  },
  {
    label: 'Third Person',
    value: CameraMode.ThirdPerson
  },
  {
    label: 'Top Down',
    value: CameraMode.TopDown
  },
  {
    label: 'Strategic',
    value: CameraMode.Strategic
  },
  {
    label: 'Dynamic',
    value: CameraMode.Dynamic
  }
]

/** Types copied from Camera Modes of engine. */
const projectionTypeSelect = [
  {
    label: 'Orthographic',
    value: 0
  },
  {
    label: 'Perspective',
    value: 1
  }
]

export const CameraPropertiesNodeEditor: EditorComponentType = (props) => {
  const cameraSettings = useComponent(props.entity, CameraSettingsComponent)
  return (
    <PropertyGroup
      name={t('editor:properties.cameraSettings.name')}
      description={t('editor:properties.cameraSettings.description')}
    >
      <InputGroup name="Projection Type" label={'Projection Type'}>
        <SelectInput
          // placeholder={projectionTypeSelect[0].label}
          value={cameraSettings.projectionType.value}
          onChange={commitProperty(CameraSettingsComponent, 'projectionType')}
          options={projectionTypeSelect}
        />
      </InputGroup>
      <InputGroup name="Camera Mode" label={'Camera Mode'}>
        <SelectInput
          // placeholder={cameraModeSelect[0].label}
          value={cameraSettings.cameraMode.value}
          onChange={commitProperty(CameraSettingsComponent, 'cameraMode')}
          options={cameraModeSelect}
        />
      </InputGroup>

      <NumericInputGroup
        name="Field Of View"
        label={'FOV'}
        onChange={updateProperty(CameraSettingsComponent, 'fov')}
        onRelease={commitProperty(CameraSettingsComponent, 'fov')}
        min={1}
        max={180}
        default={50}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={cameraSettings.fov.value}
      />

      <NumericInputGroup
        name="cameraNearClip"
        label={'Min Projection Distance'}
        onChange={updateProperty(CameraSettingsComponent, 'cameraNearClip')}
        onRelease={commitProperty(CameraSettingsComponent, 'cameraNearClip')}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={0.1}
        value={cameraSettings.cameraNearClip.value}
      />

      <NumericInputGroup
        name="cameraFarClip"
        label={'Max Projection Distance'}
        onChange={updateProperty(CameraSettingsComponent, 'cameraFarClip')}
        onRelease={commitProperty(CameraSettingsComponent, 'cameraFarClip')}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={100}
        value={cameraSettings.cameraFarClip.value}
      />
      <NumericInputGroup
        name="minCameraDistance"
        label={'Min Camera Distance'}
        onChange={updateProperty(CameraSettingsComponent, 'minCameraDistance')}
        onRelease={commitProperty(CameraSettingsComponent, 'minCameraDistance')}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={20}
        value={cameraSettings.minCameraDistance.value}
      />

      <NumericInputGroup
        name="maxCameraDistance"
        label={'Max Camera Distance'}
        onChange={updateProperty(CameraSettingsComponent, 'maxCameraDistance')}
        onRelease={commitProperty(CameraSettingsComponent, 'maxCameraDistance')}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={5}
        value={cameraSettings.maxCameraDistance.value}
      />
      <NumericInputGroup
        name="startCameraDistance"
        label={'Start Camera Distance'}
        onChange={updateProperty(CameraSettingsComponent, 'startCameraDistance')}
        onRelease={commitProperty(CameraSettingsComponent, 'startCameraDistance')}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={5}
        value={cameraSettings.startCameraDistance.value}
      />

      <NumericInputGroup
        name="minPhi"
        label={'Min Phi'}
        onChange={updateProperty(CameraSettingsComponent, 'minPhi')}
        onRelease={commitProperty(CameraSettingsComponent, 'minPhi')}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={20}
        value={cameraSettings.minPhi.value}
      />

      <NumericInputGroup
        name="maxPhi"
        label={'Max Phi'}
        onChange={updateProperty(CameraSettingsComponent, 'maxPhi')}
        onRelease={commitProperty(CameraSettingsComponent, 'maxPhi')}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={5}
        value={cameraSettings.maxPhi.value}
      />
    </PropertyGroup>
  )
}
