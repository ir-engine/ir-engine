import { Camera } from '@styled-icons/fa-solid'
import React, { useState } from 'react'
import { withTranslation } from 'react-i18next'
import { CameraModes } from '../../../../../../engine/src/camera/types/CameraModes'
import InputGroup from '../inputs/InputGroup'
import { NumericInputGroup } from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'

/**
 * [propTypes Defining properties for CameraProperties component]
 * @type {Object}
 */
type CameraPropertiesNodeEditorPropTypes = {
  editor?: any
  node?: any
  t?: any
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
    value: CameraModes.FirstPerson
  },
  {
    label: 'Shoulder Cam',
    value: CameraModes.ShoulderCam
  },
  {
    label: 'Third Person',
    value: CameraModes.ThirdPerson
  },
  {
    label: 'Top Down',
    value: CameraModes.TopDown
  },
  {
    label: 'Strategic',
    value: CameraModes.Strategic
  },
  {
    label: 'Dynamic',
    value: CameraModes.Dynamic
  }
]

const defaultCameraModeSelect = [
  {
    label: 'First Person',
    value: CameraModes.FirstPerson
  },
  {
    label: 'Shoulder Cam',
    value: CameraModes.ShoulderCam
  },
  {
    label: 'Third Person',
    value: CameraModes.ThirdPerson
  },
  {
    label: 'Top Down',
    value: CameraModes.TopDown
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

export function CameraPropertiesNodeEditor(props: CameraPropertiesNodeEditorPropTypes) {
  const { node, editor, t } = props
  const [cameraMode, setCameraMode] = useState(node.cameraMode) as any

  // function to handle changes in payloadName property
  const onChangePayload = (propName, prop) => {
    editor.setPropertySelected(propName, prop)
  }

  //defining description and shows this description in NodeEditor  with title of elementt,
  // available to add in scene in assets.
  return (
    <NodeEditor {...props} description={'Properties that will affect the player camera'}>
      {/* @ts-ignore */}
      <InputGroup name="Projection Type" label={'Projection Type'}>
        {/* @ts-ignore */}
        <SelectInput
          placeholder={projectionTypeSelect[0].label}
          value={node.projectionType}
          onChange={(value) => onChangePayload('projectionType', value)}
          options={projectionTypeSelect}
        />
      </InputGroup>
      {/* @ts-ignore */}
      <InputGroup name="Camera Mode" label={'Camera Mode'}>
        {/* @ts-ignore */}
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

      {cameraMode == CameraModes.Dynamic && (
        /* @ts-ignore */
        <InputGroup name="Default Camera Mode" label={'Default Camera Mode'}>
          {/* @ts-ignore */}
          <SelectInput
            placeholder={defaultCameraModeSelect[0].label}
            value={node.defaultCameraMode}
            onChange={(value) => onChangePayload('defaultCameraMode', value)}
            options={defaultCameraModeSelect}
          />
        </InputGroup>
      )}
      {/* @ts-ignore */}

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
        value={(node as any).fov ?? 50}
      />

      {/* @ts-ignore */}
      <NumericInputGroup
        name="cameraNearClip"
        label={'Min Projection Distance'}
        onChange={(value) => onChangePayload('cameraNearClip', value)}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={0.1}
        value={(node as any).cameraNearClip ?? 0.1}
      />

      {/* @ts-ignore */}
      <NumericInputGroup
        name="cameraFarClip"
        label={'Max Projection Distance'}
        onChange={(value) => onChangePayload('cameraFarClip', value)}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={100}
        value={(node as any).cameraFarClip ?? 100}
      />
      {/* @ts-ignore */}
      <NumericInputGroup
        name="minCameraDistance"
        label={'Min Camera Distance'}
        onChange={(value) => onChangePayload('minCameraDistance', value)}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={20}
        value={(node as any).minCameraDistance ?? 1}
      />

      {/* @ts-ignore */}
      <NumericInputGroup
        name="maxCameraDistance"
        label={'Max Camera Distance'}
        onChange={(value) => onChangePayload('maxCameraDistance', value)}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={5}
        value={(node as any).maxCameraDistance ?? 50}
      />
    </NodeEditor>
  )
}

CameraPropertiesNodeEditor.iconComponent = Camera
CameraPropertiesNodeEditor.description = 'For changing scene camera properties'

export default withTranslation()(CameraPropertiesNodeEditor)
