import { clamp } from 'lodash'
import React from 'react'
import { useTranslation } from 'react-i18next'

import styles from '@xrengine/client-core/src/admin/styles/admin.module.scss'
import { CameraComponent } from '@xrengine/engine/src/camera/components/CameraComponent'
import {
  getCamComponent,
  setRaycasting,
  setRayCount,
  setRayFrequency,
  setRayLength
} from '@xrengine/engine/src/camera/functions/CameraComponentFunctions'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ErrorComponent } from '@xrengine/engine/src/scene/components/ErrorComponent'

import CameraIcon from '@mui/icons-material/Camera'
import Typography from '@mui/material/Typography'

import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import NumericStepperInput from '../inputs/NumericStepperInput'
import NodeEditor from './NodeEditor'
import PropertyGroup from './PropertyGroup'
import { EditorComponentType, updateProperty } from './Util'

export const CameraNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const engineState = useEngineState()
  const cameraComponent = getComponent(props.node.entity, CameraComponent)
  const hasError = engineState.errorEntities[props.node.entity].get() || hasComponent(props.node.entity, ErrorComponent)

  const doRaycast = (value) => {
    updateProperty(CameraComponent, 'raycasting')(value)
    setRaycasting(value)
  }

  const doRayCount = (value) => {
    value = clamp(value, 0, 10)
    updateProperty(CameraComponent, 'rayCount')(value)
    setRayCount(value)
  }

  const doRayLength = (value) => {
    value = clamp(value, 0, 150)
    updateProperty(CameraComponent, 'rayLength')(value)
    setRayLength(value)
  }

  const doRayFreq = (value) => {
    value = clamp(value, 0, 10)
    updateProperty(CameraComponent, 'rayFrequency')(value)
    setRayFrequency(value)
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.camera.name')}
      description={t('editor:properties.camera.description')}
    >
      <PropertyGroup name={t('editor:properties.camera.lbl-camera-raycast')}>
        <InputGroup name="Raycasting" label={t('editor:properties.camera.lbl-camera-raycast-toggle')}>
          <BooleanInput value={getCamComponent().raycasting} onChange={doRaycast} />
        </InputGroup>
        <InputGroup name="Ray Count" label={t('editor:properties.camera.lbl-camera-raycast-count')}>
          <NumericStepperInput mediumStep={1} value={getCamComponent().rayCount} onChange={doRayCount} />
        </InputGroup>
        <InputGroup name="Ray Length" label={t('editor:properties.camera.lbl-camera-raycast-length')}>
          <NumericStepperInput mediumStep={0.1} value={getCamComponent().rayLength} onChange={doRayLength} />
        </InputGroup>
        <InputGroup name="Ray Frequency" label={t('editor:properties.camera.lbl-camera-raycast-frequency')}>
          <NumericStepperInput mediumStep={0.01} value={getCamComponent().rayFrequency} onChange={doRayFreq} />
        </InputGroup>
      </PropertyGroup>
    </NodeEditor>
  )
}

CameraNodeEditor.iconComponent = CameraIcon

export default CameraNodeEditor
