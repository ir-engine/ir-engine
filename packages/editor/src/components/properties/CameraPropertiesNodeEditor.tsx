import { t } from 'i18next'
import React from 'react'

import { getCameraSceneMetadataState } from '@etherealengine/engine/src/camera/systems/CameraSystem'
import { CameraMode } from '@etherealengine/engine/src/camera/types/CameraMode'
import { ProjectionType } from '@etherealengine/engine/src/camera/types/ProjectionType'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { useHookstate } from '@etherealengine/hyperflux'

import CameraAltIcon from '@mui/icons-material/CameraAlt'

import { InputGroup } from '../inputs/InputGroup'
import { NumericInputGroup } from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import PropertyGroup from './PropertyGroup'

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

export const CameraPropertiesNodeEditor = () => {
  const cameraSettings = useHookstate(getCameraSceneMetadataState())
  if (!cameraSettings.value) return null

  return (
    <PropertyGroup
      name={t('editor:properties.cameraSettings.name')}
      description={t('editor:properties.cameraSettings.description')}
    >
      <InputGroup name="Projection Type" label={'Projection Type'}>
        <SelectInput
          // placeholder={projectionTypeSelect[0].label}
          value={cameraSettings.projectionType.value}
          onChange={(val: ProjectionType) => cameraSettings.projectionType.set(val)}
          options={projectionTypeSelect}
        />
      </InputGroup>
      <InputGroup name="Camera Mode" label={'Camera Mode'}>
        <SelectInput
          // placeholder={cameraModeSelect[0].label}
          value={cameraSettings.cameraMode.value}
          onChange={(val: CameraMode) => cameraSettings.cameraMode.set(val)}
          options={cameraModeSelect}
        />
      </InputGroup>

      <NumericInputGroup
        name="Field Of View"
        label={'FOV'}
        onChange={(val) => cameraSettings.fov.set(val)}
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
        onChange={(val) => cameraSettings.cameraNearClip.set(val)}
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
        onChange={(val) => cameraSettings.cameraFarClip.set(val)}
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
        onChange={(val) => cameraSettings.minCameraDistance.set(val)}
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
        onChange={(val) => cameraSettings.maxCameraDistance.set(val)}
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
        onChange={(val) => cameraSettings.startCameraDistance.set(val)}
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
        onChange={(val) => cameraSettings.minPhi.set(val)}
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
        onChange={(val) => cameraSettings.maxPhi.set(val)}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={5}
        value={cameraSettings.maxPhi.value}
      />
      <NumericInputGroup
        name="startPhi"
        label={'Start Phi'}
        onChange={(val) => cameraSettings.startPhi.set(val)}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={5}
        value={cameraSettings.startPhi.value}
      />
    </PropertyGroup>
  )
}
