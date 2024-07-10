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

import { getOptionalComponent, useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { CameraSettingsComponent } from '@etherealengine/engine/src/scene/components/CameraSettingsComponent'
import { FollowCameraMode } from '@etherealengine/spatial/src/camera/types/FollowCameraMode'

import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import {
  EditorComponentType,
  commitProperties,
  commitProperty,
  updateProperty
} from '@etherealengine/editor/src/components/properties/Util'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { MeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import { iterateEntityNode } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { Button } from '@mui/material'
import { HiOutlineCamera } from 'react-icons/hi'
import { Box3, Vector3 } from 'three'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'
import PropertyGroup from '../group'

/** Types copied from Camera Modes of engine. */
const cameraModeSelect = [
  {
    label: 'First Person',
    value: FollowCameraMode.FirstPerson
  },
  {
    label: 'Shoulder Cam',
    value: FollowCameraMode.ShoulderCam
  },
  {
    label: 'Third Person',
    value: FollowCameraMode.ThirdPerson
  },
  {
    label: 'Top Down',
    value: FollowCameraMode.TopDown
  },
  {
    label: 'Strategic',
    value: FollowCameraMode.Strategic
  },
  {
    label: 'Dynamic',
    value: FollowCameraMode.Dynamic
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

const modelQuery = defineQuery([ModelComponent])
const _box3 = new Box3()

export const CameraPropertiesNodeEditor: EditorComponentType = (props) => {
  const cameraSettings = useComponent(props.entity, CameraSettingsComponent)

  const calculateClippingPlanes = () => {
    const box = new Box3()
    const modelEntities = modelQuery()
    for (const entity of modelEntities) {
      console.log(entity)
      iterateEntityNode(entity, (entity) => {
        const mesh = getOptionalComponent(entity, MeshComponent)
        if (mesh?.geometry?.boundingBox) {
          console.log(mesh)
          _box3.copy(mesh.geometry.boundingBox)
          _box3.applyMatrix4(mesh.matrixWorld)
          box.union(_box3)
        }
      })
    }
    const boxSize = box.getSize(new Vector3()).length()
    commitProperties(
      CameraSettingsComponent,
      {
        cameraNearClip: 0.1,
        cameraFarClip: Math.max(boxSize, 100)
      },
      [props.entity]
    )
  }

  return (
    <PropertyGroup
      name={t('editor:properties.cameraSettings.name')}
      description={t('editor:properties.cameraSettings.description')}
      icon={<CameraPropertiesNodeEditor.iconComponent />}
    >
      <InputGroup name="Projection type" label={'Projection type'}>
        <SelectInput
          // placeholder={projectionTypeSelect[0].label}
          value={cameraSettings.projectionType.value}
          onChange={commitProperty(CameraSettingsComponent, 'projectionType')}
          options={projectionTypeSelect}
        />
      </InputGroup>
      <InputGroup name="Camera mode" label={'Camera mode'}>
        <SelectInput
          // placeholder={cameraModeSelect[0].label}
          value={cameraSettings.cameraMode.value}
          onChange={commitProperty(CameraSettingsComponent, 'cameraMode')}
          options={cameraModeSelect}
        />
      </InputGroup>
      <InputGroup name="Field of view" label={'FOV'}>
        <NumericInput
          onChange={updateProperty(CameraSettingsComponent, 'fov')}
          onRelease={commitProperty(CameraSettingsComponent, 'fov')}
          min={1}
          max={180}
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={cameraSettings.fov.value}
        />
      </InputGroup>
      <Button onClick={calculateClippingPlanes}>Calculate Clipping Planes</Button>
      <InputGroup name="cameraNearClip" label={'Projection distance'} className="gap-2">
        <div className="flex gap-2">
          <NumericInput
            onChange={updateProperty(CameraSettingsComponent, 'cameraNearClip')}
            onRelease={commitProperty(CameraSettingsComponent, 'cameraNearClip')}
            min={0.001}
            smallStep={0.001}
            mediumStep={0.01}
            largeStep={0.1}
            value={cameraSettings.cameraNearClip.value}
            className="w-1/2"
          />
          <NumericInput
            onChange={updateProperty(CameraSettingsComponent, 'cameraFarClip')}
            onRelease={commitProperty(CameraSettingsComponent, 'cameraFarClip')}
            min={0.001}
            smallStep={0.001}
            mediumStep={0.01}
            largeStep={0.1}
            value={cameraSettings.cameraFarClip.value}
            className="w-1/2"
          />
        </div>
      </InputGroup>
      <InputGroup name="minCameraDistance" label={'Camera distance'} className="gap-2">
        <div className="flex gap-2">
          <NumericInput
            onChange={updateProperty(CameraSettingsComponent, 'minCameraDistance')}
            onRelease={commitProperty(CameraSettingsComponent, 'minCameraDistance')}
            min={0.001}
            smallStep={0.001}
            mediumStep={0.01}
            largeStep={0.1}
            value={cameraSettings.minCameraDistance.value}
            className="w-1/2"
          />
          <NumericInput
            onChange={updateProperty(CameraSettingsComponent, 'maxCameraDistance')}
            onRelease={commitProperty(CameraSettingsComponent, 'maxCameraDistance')}
            min={0.001}
            smallStep={0.001}
            mediumStep={0.01}
            largeStep={0.1}
            value={cameraSettings.maxCameraDistance.value}
            className="w-1/2"
          />
        </div>
      </InputGroup>
      <InputGroup name="startCameraDistance" label={'Start camera distance'}>
        <NumericInput
          onChange={updateProperty(CameraSettingsComponent, 'startCameraDistance')}
          onRelease={commitProperty(CameraSettingsComponent, 'startCameraDistance')}
          min={0.001}
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={cameraSettings.startCameraDistance.value}
        />
      </InputGroup>
      <InputGroup name="minPhi" label={'Phi'} className="gap-2">
        <div className="flex gap-2">
          <NumericInput
            onChange={updateProperty(CameraSettingsComponent, 'minPhi')}
            onRelease={commitProperty(CameraSettingsComponent, 'minPhi')}
            min={0.001}
            smallStep={0.001}
            mediumStep={0.01}
            largeStep={0.1}
            value={cameraSettings.minPhi.value}
            className="w-1/2"
          />
          <NumericInput
            onChange={updateProperty(CameraSettingsComponent, 'maxPhi')}
            onRelease={commitProperty(CameraSettingsComponent, 'maxPhi')}
            min={0.001}
            smallStep={0.001}
            mediumStep={0.01}
            largeStep={0.1}
            value={cameraSettings.maxPhi.value}
            className="w-1/2"
          />
        </div>
      </InputGroup>
    </PropertyGroup>
  )
}

CameraPropertiesNodeEditor.iconComponent = HiOutlineCamera

export default CameraPropertiesNodeEditor
