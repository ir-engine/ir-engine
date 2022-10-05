import React from 'react'
import { useTranslation } from 'react-i18next'
import { Euler } from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import {
  SCENE_COMPONENT_DYNAMIC_LOAD,
  SceneDynamicLoadTagComponent
} from '@xrengine/engine/src/scene/components/SceneDynamicLoadTagComponent'
import { LocalTransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

import { executeCommandWithHistoryOnSelection } from '../../classes/History'
import { TagComponentOperation } from '../../commands/TagComponentCommand'
import EditorCommands from '../../constants/EditorCommands'
import BooleanInput from '../inputs/BooleanInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
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
  const { t } = useTranslation()

  const onChangeDynamicLoad = (value) => {
    executeCommandWithHistoryOnSelection({
      type: EditorCommands.TAG_COMPONENT,
      operations: [
        {
          component: SceneDynamicLoadTagComponent,
          sceneComponentName: SCENE_COMPONENT_DYNAMIC_LOAD,
          type: value ? TagComponentOperation.ADD : TagComponentOperation.REMOVE
        }
      ]
    })
  }

  //function to handle the position properties
  const onChangePosition = (value) => {
    executeCommandWithHistoryOnSelection({
      type: EditorCommands.POSITION,
      positions: [value]
    })
  }

  //function to handle changes rotation properties
  const onChangeRotation = (value: Euler) => {
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
  const transform =
    getComponent(props.node.entity, LocalTransformComponent) ?? getComponent(props.node.entity, TransformComponent)

  return (
    <NodeEditor component={TransformComponent} {...props} name={t('editor:properties.transform.title')}>
      <InputGroup name="Dynamically Load Children" label={t('editor:properties.lbl-dynamicLoad')}>
        <BooleanInput
          value={hasComponent(props.node.entity, SceneDynamicLoadTagComponent)}
          onChange={onChangeDynamicLoad}
        />
        {hasComponent(props.node.entity, SceneDynamicLoadTagComponent) && (
          <CompoundNumericInput
            style={{ paddingLeft: `12px`, paddingRight: `3px` }}
            min={1}
            max={100}
            step={1}
            value={getComponent(props.node.entity, SceneDynamicLoadTagComponent).distance}
            onChange={updateProperty(SceneDynamicLoadTagComponent, 'distance')}
          />
        )}
      </InputGroup>
      <InputGroup name="Position" label={t('editor:properties.transform.lbl-postition')}>
        <Vector3Input
          value={transform.position}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={onChangePosition}
        />
      </InputGroup>
      <InputGroup name="Rotation" label={t('editor:properties.transform.lbl-rotation')}>
        <EulerInput quaternion={transform.rotation} onChange={onChangeRotation} unit="°" />
      </InputGroup>
      <InputGroup name="Scale" label={t('editor:properties.transform.lbl-scale')}>
        <Vector3Input
          uniformScaling
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={transform.scale}
          onChange={onChangeScale}
        />
      </InputGroup>
    </NodeEditor>
  )
}

export default TransformPropertyGroup
