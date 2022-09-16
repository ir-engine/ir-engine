import { t } from 'i18next'
import React from 'react'

import { CameraMode } from '@xrengine/engine/src/camera/types/CameraMode'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import {
  CameraPropertiesComponent,
  CameraPropertiesComponentType,
  RaycastPropsType
} from '@xrengine/engine/src/scene/components/CameraPropertiesComponent'

import CameraAltIcon from '@mui/icons-material/CameraAlt'

import BooleanInput from '../inputs/BooleanInput'
import { InputGroup } from '../inputs/InputGroup'
import { NumericInputGroup } from '../inputs/NumericInputGroup'
import NumericStepperInput from '../inputs/NumericStepperInput'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import PropertyGroup from './PropertyGroup'
import { EditorComponentType, updateProperty } from './Util'

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
    label: 'Perspective',
    value: 0
  },
  {
    label: 'Orthographic',
    value: 1
  }
]

export const CameraPropertiesNodeEditor: EditorComponentType = (props) => {
  const cameraPropertiesComponent = getComponent(props.node.entity, CameraPropertiesComponent)

  function updateRaycastProps(propName: keyof RaycastPropsType) {
    return (value) => {
      const rProps = Object.entries(cameraPropertiesComponent.raycastProps)
        .map(([k, v]) => {
          const result: Object = {}
          if (k !== propName) result[k] = v
          else result[k] = value
          return result
        })
        .reduce((a, b) => {
          return { ...a, ...b }
        }) as RaycastPropsType
      updateProperty(CameraPropertiesComponent, 'raycastProps')(rProps)
    }
  }

  return (
    <NodeEditor {...props} description={'Properties that will affect the player camera'}>
      <InputGroup name="Start In Free Look" label={'Start In Free Look'}>
        <BooleanInput
          value={cameraPropertiesComponent.startInFreeLook}
          onChange={updateProperty(CameraPropertiesComponent, 'startInFreeLook')}
        />
      </InputGroup>
      <InputGroup name="Projection Type" label={'Projection Type'}>
        <SelectInput
          key={props.node.entity}
          placeholder={projectionTypeSelect[0].label}
          value={cameraPropertiesComponent.projectionType}
          onChange={updateProperty(CameraPropertiesComponent, 'projectionType')}
          options={projectionTypeSelect}
        />
      </InputGroup>
      <InputGroup name="Camera Mode" label={'Camera Mode'}>
        <SelectInput
          key={props.node.entity}
          placeholder={cameraModeSelect[0].label}
          value={cameraPropertiesComponent.cameraMode}
          onChange={updateProperty(CameraPropertiesComponent, 'cameraMode')}
          options={cameraModeSelect}
        />
      </InputGroup>

      <NumericInputGroup
        name="Field Of View"
        label={'FOV'}
        onChange={updateProperty(CameraPropertiesComponent, 'fov')}
        min={1}
        max={180}
        default={50}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={cameraPropertiesComponent.fov}
      />

      <NumericInputGroup
        name="cameraNearClip"
        label={'Min Projection Distance'}
        onChange={updateProperty(CameraPropertiesComponent, 'cameraNearClip')}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={0.1}
        value={cameraPropertiesComponent.cameraNearClip}
      />

      <NumericInputGroup
        name="cameraFarClip"
        label={'Max Projection Distance'}
        onChange={updateProperty(CameraPropertiesComponent, 'cameraFarClip')}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={100}
        value={cameraPropertiesComponent.cameraFarClip}
      />
      <NumericInputGroup
        name="minCameraDistance"
        label={'Min Camera Distance'}
        onChange={updateProperty(CameraPropertiesComponent, 'minCameraDistance')}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={20}
        value={cameraPropertiesComponent.minCameraDistance}
      />

      <NumericInputGroup
        name="maxCameraDistance"
        label={'Max Camera Distance'}
        onChange={updateProperty(CameraPropertiesComponent, 'maxCameraDistance')}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={5}
        value={cameraPropertiesComponent.maxCameraDistance}
      />
      <NumericInputGroup
        name="startCameraDistance"
        label={'Start Camera Distance'}
        onChange={updateProperty(CameraPropertiesComponent, 'startCameraDistance')}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={5}
        value={cameraPropertiesComponent.startCameraDistance}
      />

      <NumericInputGroup
        name="minPhi"
        label={'Min Phi'}
        onChange={updateProperty(CameraPropertiesComponent, 'minPhi')}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={20}
        value={cameraPropertiesComponent.minPhi}
      />

      <NumericInputGroup
        name="maxPhi"
        label={'Max Phi'}
        onChange={updateProperty(CameraPropertiesComponent, 'maxPhi')}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={5}
        value={cameraPropertiesComponent.maxPhi}
      />
      <NumericInputGroup
        name="startPhi"
        label={'Start Phi'}
        onChange={updateProperty(CameraPropertiesComponent, 'startPhi')}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={5}
        value={cameraPropertiesComponent.startPhi}
      />
      <PropertyGroup name={t('editor:properties.camera.lbl-camera-raycast')}>
        <InputGroup name="Raycasting" label={t('editor:properties.camera.lbl-camera-raycast-toggle')}>
          <BooleanInput
            value={cameraPropertiesComponent.raycastProps.enabled}
            onChange={updateRaycastProps('enabled')}
          />
        </InputGroup>
        <InputGroup name="Ray Count" label={t('editor:properties.camera.lbl-camera-raycast-count')}>
          <NumericStepperInput
            mediumStep={1}
            value={cameraPropertiesComponent.raycastProps.rayCount}
            onChange={updateRaycastProps('rayCount')}
          />
        </InputGroup>
        <InputGroup name="Ray Length" label={t('editor:properties.camera.lbl-camera-raycast-length')}>
          <NumericStepperInput
            mediumStep={0.1}
            value={cameraPropertiesComponent.raycastProps.rayLength}
            onChange={updateRaycastProps('rayLength')}
          />
        </InputGroup>
        <InputGroup name="Ray Frequency" label={t('editor:properties.camera.lbl-camera-raycast-frequency')}>
          <NumericStepperInput
            mediumStep={0.01}
            value={cameraPropertiesComponent.raycastProps.rayFrequency}
            onChange={updateRaycastProps('rayFrequency')}
          />
        </InputGroup>
      </PropertyGroup>
    </NodeEditor>
  )
}

CameraPropertiesNodeEditor.iconComponent = CameraAltIcon

export default CameraPropertiesNodeEditor
