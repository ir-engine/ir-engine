import React, { useState, useEffect, useCallback } from 'react'
import PropertyGroup from './PropertyGroup'
import InputGroup from '../inputs/InputGroup'
import Vector3Input from '../inputs/Vector3Input'
import EulerInput from '../inputs/EulerInput'
import { withTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'
import EditorEvents from '../../constants/EditorEvents'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

/**
 * TransformPropertyGroupProps declaring properties for TransformPropertyGroup.
 *
 * @author Robert Long
 * @type {Object}
 */
type TransformPropertyGroupProps = {
  node?: any
  t: Function
}

/**
 * TransformPropertyGroup component is used to render editor view to customize properties.
 *
 * @author Robert Long
 * @type {class component}
 */
export const TransformPropertyGroup = (props: TransformPropertyGroupProps) => {
  const [, updateState] = useState()

  const forceUpdate = useCallback(() => updateState({}), [])

  const onObjectsChanged = () => {
    forceUpdate()
  }

  useEffect(() => {
    CommandManager.instance.addListener(EditorEvents.OBJECTS_CHANGED.toString(), onObjectsChanged)
  }, [])

  useEffect(() => {
    CommandManager.instance.removeListener(EditorEvents.OBJECTS_CHANGED.toString(), onObjectsChanged)
  }, null)

  //function to handle the position properties
  const onChangePosition = (value) => {
    // CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.POSITION, { positions: value })
    const transformComponent = getComponent(props.node.eid, TransformComponent)
    transformComponent.position = value
    forceUpdate()
  }

  //function to handle changes rotation properties
  const onChangeRotation = (value) => {
    // CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.ROTATION, { rotations: value })
    const transformComponent = getComponent(props.node.eid, TransformComponent)
    transformComponent.eulerRotation = value
    forceUpdate()
  }

  //function to handle changes in scale properties
  const onChangeScale = (value) => {
    // CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.SCALE, {
    //   scales: value,
    //   overrideScale: true
    // })
    const transformComponent = getComponent(props.node.eid, TransformComponent)
    transformComponent.scale = value
    forceUpdate()
  }

  //rendering editor view for Transform properties
  const { node } = props
  const transformComponent = getComponent(node.eid, TransformComponent)

  return (
    <PropertyGroup name={props.t('editor:properties.transform.title')}>
      <InputGroup name="Position" label={props.t('editor:properties.transform.lbl-postition')}>
        <Vector3Input
          value={transformComponent.position}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={onChangePosition}
        />
      </InputGroup>
      <InputGroup name="Rotation" label={props.t('editor:properties.transform.lbl-rotation')}>
        <EulerInput value={transformComponent.eulerRotation} onChange={onChangeRotation} unit="°" />
      </InputGroup>
      <InputGroup name="Scale" label={props.t('editor:properties.transform.lbl-scale')}>
        <Vector3Input
          uniformScaling
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={transformComponent.scale}
          onChange={onChangeScale}
        />
      </InputGroup>
    </PropertyGroup>
  )
}

export default withTranslation()(
  React.memo(TransformPropertyGroup, (prevProps, nextProps) => prevProps.node === nextProps.node)
)
