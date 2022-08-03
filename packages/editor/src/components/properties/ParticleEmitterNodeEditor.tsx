import React from 'react'
import { useTranslation } from 'react-i18next'
import ReactJson from 'react-json-view'

import * as EasingFunctions from '@xrengine/engine/src/common/functions/EasingFunctions'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ErrorComponent } from '@xrengine/engine/src/scene/components/ErrorComponent'
import { ParticleEmitterComponent } from '@xrengine/engine/src/scene/components/ParticleEmitterComponent'

import GrainIcon from '@mui/icons-material/Grain'

import { camelPad } from '../../functions/utils'
import ColorInput from '../inputs/ColorInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import ImageInput from '../inputs/ImageInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import Vector3Input from '../inputs/Vector3Input'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

//creating object containing Curve options for SelectInput
const CurveOptions = Object.keys(EasingFunctions).map((name) => ({
  label: camelPad(name),
  value: name
}))

export const ParticleEmitterNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const engineState = useEngineState()
  const entity = props.node.entity
  const particleComponent = getComponent(entity, ParticleEmitterComponent)
  const hasError = engineState.errorEntities[entity].get() || hasComponent(entity, ErrorComponent)

  //if (!particleComponent) return <></>
  return (
    <NodeEditor {...props} description={t('editor:properties.partileEmitter.description')}>
      <ReactJson
        src={particleComponent.src}
        onEdit={(edit) => {
          particleComponent.src = edit.updated_src
        }}
      />
    </NodeEditor>
  )
}

ParticleEmitterNodeEditor.iconComponent = GrainIcon

export default ParticleEmitterNodeEditor
