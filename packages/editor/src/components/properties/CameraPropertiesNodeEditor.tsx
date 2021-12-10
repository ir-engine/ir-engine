import React, { useState } from 'react'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import { CameraMode } from '@xrengine/engine/src/camera/types/CameraMode'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import { NumericInputGroup } from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import { CommandManager } from '../../managers/CommandManager'

/**
 * [propTypes Defining properties for CameraProperties component]
 * @type {Object}
 */
type CameraPropertiesNodeEditorPropTypes = {
  node?: any
}

interface Props {
  node?: any
  value?: any
  onChangeFunction?: any
  op?: any
  getProp?: any
}

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

const defaultCameraModeSelect = [
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

/**
 * [BoxColliderNodeEditor is used to provide properties to customize box collider element]
 * @type {[component class]}
 */

export const CameraPropertiesNodeEditor = (props: CameraPropertiesNodeEditorPropTypes) => {
  const { node } = props
  const [cameraMode, setCameraMode] = useState(node.cameraMode) as any

  // function to handle changes in payloadName property
  const onChangePayload = (propName, prop) => {
    CommandManager.instance.setPropertyOnSelection(propName, prop)
  }

  return (
    <NodeEditor {...props} description={'Properties that will affect the player camera'}>
      <InputGroup name="Start In Free Look" label={'Start In Free Look'}>
        <BooleanInput
          value={(node as any).startInFreeLook}
          onChange={(value) => onChangePayload('startInFreeLook', value)}
        />
      </InputGroup>
      <InputGroup name="Projection Type" label={'Projection Type'}>
        <SelectInput
          placeholder={projectionTypeSelect[0].label}
          value={node.projectionType}
          onChange={(value) => onChangePayload('projectionType', value)}
          options={projectionTypeSelect}
        />
      </InputGroup>
      <InputGroup name="Camera Mode" label={'Camera Mode'}>
        <SelectInput
          placeholder={cameraModeSelect[0].label}
          value={node.cameraMode}
          onChange={(value) => {
            onChangePayload('cameraMode', value)
            setCameraMode(value)
          }}
          options={cameraModeSelect}
        />
      </InputGroup>

      {cameraMode == CameraMode.Dynamic && (
        <InputGroup name="Default Camera Mode" label={'Default Camera Mode'}>
          <SelectInput
            placeholder={defaultCameraModeSelect[0].label}
            value={node.defaultCameraMode}
            onChange={(value) => onChangePayload('defaultCameraMode', value)}
            options={defaultCameraModeSelect}
          />
        </InputGroup>
      )}

      <NumericInputGroup
        name="Field Of View"
        label={'FOV'}
        onChange={(value) => onChangePayload('fov', value)}
        min={1}
        max={180}
        default={50}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={(node as any).fov}
      />

      <NumericInputGroup
        name="cameraNearClip"
        label={'Min Projection Distance'}
        onChange={(value) => onChangePayload('cameraNearClip', value)}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={0.1}
        value={(node as any).cameraNearClip}
      />

      <NumericInputGroup
        name="cameraFarClip"
        label={'Max Projection Distance'}
        onChange={(value) => onChangePayload('cameraFarClip', value)}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={100}
        value={(node as any).cameraFarClip}
      />
      <NumericInputGroup
        name="minCameraDistance"
        label={'Min Camera Distance'}
        onChange={(value) => onChangePayload('minCameraDistance', value)}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={20}
        value={(node as any).minCameraDistance}
      />

      <NumericInputGroup
        name="maxCameraDistance"
        label={'Max Camera Distance'}
        onChange={(value) => onChangePayload('maxCameraDistance', value)}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={5}
        value={(node as any).maxCameraDistance}
      />
      <NumericInputGroup
        name="startCameraDistance"
        label={'Start Camera Distance'}
        onChange={(value) => onChangePayload('startCameraDistance', value)}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={5}
        value={(node as any).startCameraDistance}
      />

      <NumericInputGroup
        name="minPhi"
        label={'Min Phi'}
        onChange={(value) => onChangePayload('minPhi', value)}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={20}
        value={(node as any).minPhi}
      />

      <NumericInputGroup
        name="maxPhi"
        label={'Max Phi'}
        onChange={(value) => onChangePayload('maxPhi', value)}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={5}
        value={(node as any).maxPhi}
      />
      <NumericInputGroup
        name="startPhi"
        label={'Start Phi'}
        onChange={(value) => onChangePayload('startPhi', value)}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={5}
        value={(node as any).startPhi}
      />
    </NodeEditor>
  )
}

CameraPropertiesNodeEditor.iconComponent = CameraAltIcon

export default CameraPropertiesNodeEditor
