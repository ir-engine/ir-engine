import React from 'react'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import { CameraMode } from '@xrengine/engine/src/camera/types/CameraMode'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import { NumericInputGroup } from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import { CommandManager } from '../../managers/CommandManager'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { CameraPropertiesComponent } from '@xrengine/engine/src/scene/components/CameraPropertiesComponent'
import { EditorComponentType } from './Util'

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

export const CameraPropertiesNodeEditor: EditorComponentType = (props) => {
  const cameraPropertiesComponent = getComponent(props.node.entity, CameraPropertiesComponent)

  // function to handle changes in payloadName property
  const onChangePayload = (prop) => (value) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      component: CameraPropertiesComponent,
      properties: { [prop]: value }
    })
  }

  return (
    <NodeEditor {...props} description={'Properties that will affect the player camera'}>
      <InputGroup name="Start In Free Look" label={'Start In Free Look'}>
        <BooleanInput value={cameraPropertiesComponent.startInFreeLook} onChange={onChangePayload('startInFreeLook')} />
      </InputGroup>
      <InputGroup name="Projection Type" label={'Projection Type'}>
        <SelectInput
          placeholder={projectionTypeSelect[0].label}
          value={cameraPropertiesComponent.projectionType}
          onChange={onChangePayload('projectionType')}
          options={projectionTypeSelect}
        />
      </InputGroup>
      <InputGroup name="Camera Mode" label={'Camera Mode'}>
        <SelectInput
          placeholder={cameraModeSelect[0].label}
          value={cameraPropertiesComponent.cameraMode}
          onChange={onChangePayload('cameraMode')}
          options={cameraModeSelect}
        />
      </InputGroup>

      <NumericInputGroup
        name="Field Of View"
        label={'FOV'}
        onChange={onChangePayload('fov')}
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
        onChange={onChangePayload('cameraNearClip')}
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
        onChange={onChangePayload('cameraFarClip')}
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
        onChange={onChangePayload('minCameraDistance')}
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
        onChange={onChangePayload('maxCameraDistance')}
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
        onChange={onChangePayload('startCameraDistance')}
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
        onChange={onChangePayload('minPhi')}
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
        onChange={onChangePayload('maxPhi')}
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
        onChange={onChangePayload('startPhi')}
        min={0.001}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        default={5}
        value={cameraPropertiesComponent.startPhi}
      />
    </NodeEditor>
  )
}

CameraPropertiesNodeEditor.iconComponent = CameraAltIcon

export default CameraPropertiesNodeEditor
