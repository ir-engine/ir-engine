import { useComponent } from '@etherealengine/ecs'
import { AudioAnalysisComponent } from '@etherealengine/engine/src/scene/components/AudioAnalysisComponent'
import React from 'react'
import InputGroup from '../inputs/InputGroup'
import NumericInput from '../inputs/NumericInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'

export const AudioAnalysisEditor: EditorComponentType = (props) => {
  const audioAnalysisComponent = useComponent(props.entity, AudioAnalysisComponent)
  return (
    <NodeEditor description={'Description'} {...props}>
      <InputGroup name="Frequency" label="Frequency">
        <NumericInput value={audioAnalysisComponent.frequency.value!} />
      </InputGroup>
    </NodeEditor>
  )
}
