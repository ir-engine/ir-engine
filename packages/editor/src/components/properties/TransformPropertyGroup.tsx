import React from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { LocalTransformComponent } from '@xrengine/engine/src/transform/components/LocalTransformComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

import { executeCommandWithHistoryOnSelection } from '../../classes/History'
import EditorCommands from '../../constants/EditorCommands'
import { useSelectionState } from '../../services/SelectionServices'
import EulerInput from '../inputs/EulerInput'
import InputGroup from '../inputs/InputGroup'
import Vector3Input from '../inputs/Vector3Input'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

/**
 * TransformPropertyGroup component is used to render editor view to customize properties.
 *
 * @type {class component}
 */
export const TransformPropertyGroup: EditorComponentType = (props) => {
  const selectionState = useSelectionState()
  const { t } = useTranslation()

  // access state to detect the change
  selectionState.objectChangeCounter.value

  //function to handle the position properties
  const onChangePosition = (value) => {
    executeCommandWithHistoryOnSelection({
      type: EditorCommands.POSITION,
      positions: [value]
    })
  }

  //function to handle changes rotation properties
  const onChangeRotation = (value) => {
    executeCommandWithHistoryOnSelection({
      type: EditorCommands.ROTATION,
      rotations: [value]
    })
  }

  //function to handle changes in scale properties
  const onChangeScale = (value) => {
    executeCommandWithHistoryOnSelection({
      type: EditorCommands.SCALE,
      scales: [value],
      overrideScale: true
    })
  }

  //rendering editor view for Transform properties
  const transfromComponent = getComponent(props.node.entity, TransformComponent)
  const localTransfromComponent = getComponent(props.node.entity, LocalTransformComponent)
  const transform = localTransfromComponent ?? transfromComponent

  return (
    <NodeEditor {...props} name={t('editor:properties.transform.title')}>
      <InputGroup name="Position" label={t('editor:properties.transform.lbl-postition')}>
        <Vector3Input
          value={transform.position}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={localTransfromComponent ? updateProperty(LocalTransformComponent, 'position') : onChangePosition}
        />
      </InputGroup>
      <InputGroup name="Rotation" label={t('editor:properties.transform.lbl-rotation')}>
        <EulerInput
          quaternion={transform.rotation}
          onChange={localTransfromComponent ? updateProperty(LocalTransformComponent, 'rotation') : onChangeRotation}
          unit="°"
        />
      </InputGroup>
      <InputGroup name="Scale" label={t('editor:properties.transform.lbl-scale')}>
        <Vector3Input
          uniformScaling
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={transform.scale}
          onChange={localTransfromComponent ? updateProperty(LocalTransformComponent, 'scale') : onChangeScale}
        />
      </InputGroup>
    </NodeEditor>
  )
}

export default TransformPropertyGroup
