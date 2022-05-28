import React from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

import { executeCommandWithHistoryOnSelection } from '../../classes/History'
import EditorCommands from '../../constants/EditorCommands'
import { useSelectionState } from '../../services/SelectionServices'
import EulerInput from '../inputs/EulerInput'
import InputGroup from '../inputs/InputGroup'
import Vector3Input from '../inputs/Vector3Input'
import PropertyGroup from './PropertyGroup'
import { EditorComponentType } from './Util'

/**
 * TransformPropertyGroup component is used to render editor view to customize properties.
 *
 * @author Robert Long
 * @type {class component}
 */
export const TransformPropertyGroup: EditorComponentType = (props) => {
  const selectionState = useSelectionState()
  const { t } = useTranslation()

  // access state to detect the change
  selectionState.objectChangeCounter.value

  //function to handle the position properties
  const onChangePosition = (value) => {
    executeCommandWithHistoryOnSelection({ type: EditorCommands.POSITION, positions: [value] })
  }

  //function to handle changes rotation properties
  const onChangeRotation = (value) => {
    executeCommandWithHistoryOnSelection({ type: EditorCommands.ROTATION, rotations: [value] })
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

  return (
    <PropertyGroup name={t('editor:properties.transform.title')}>
      <InputGroup name="Position" label={t('editor:properties.transform.lbl-postition')}>
        <Vector3Input
          value={transfromComponent.position}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={onChangePosition}
        />
      </InputGroup>
      <InputGroup name="Rotation" label={t('editor:properties.transform.lbl-rotation')}>
        <EulerInput quaternion={transfromComponent.rotation} onChange={onChangeRotation} unit="°" />
      </InputGroup>
      <InputGroup name="Scale" label={t('editor:properties.transform.lbl-scale')}>
        <Vector3Input
          uniformScaling
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={transfromComponent.scale}
          onChange={onChangeScale}
        />
      </InputGroup>
    </PropertyGroup>
  )
}

export default React.memo(TransformPropertyGroup, (prevProps, nextProps) => prevProps.node === nextProps.node)
