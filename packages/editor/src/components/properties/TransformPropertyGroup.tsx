import React, { useState, useEffect, useCallback } from 'react'
import PropertyGroup from './PropertyGroup'
import InputGroup from '../inputs/InputGroup'
import Vector3Input from '../inputs/Vector3Input'
import EulerInput from '../inputs/EulerInput'
import { useTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'
import EditorCommands from '../../constants/EditorCommands'
import EditorEvents from '../../constants/EditorEvents'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { EditorComponentType } from './Util'

/**
 * TransformPropertyGroup component is used to render editor view to customize properties.
 *
 * @author Robert Long
 * @type {class component}
 */
export const TransformPropertyGroup: EditorComponentType = (props) => {
  const [, updateState] = useState<any>()
  const { t } = useTranslation()

  const forceUpdate = useCallback(() => updateState({}), [])

  useEffect(() => {
    CommandManager.instance.addListener(EditorEvents.OBJECTS_CHANGED.toString(), forceUpdate)

    return () => {
      CommandManager.instance.removeListener(EditorEvents.OBJECTS_CHANGED.toString(), forceUpdate)
    }
  }, [])

  //function to handle the position properties
  const onChangePosition = (value) => {
    CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.POSITION, { positions: value })
  }

  //function to handle changes rotation properties
  const onChangeRotation = (value) => {
    CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.ROTATION, { rotations: value })
  }

  //function to handle changes in scale properties
  const onChangeScale = (value) => {
    CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.SCALE, {
      scales: value,
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
        <EulerInput value={transfromComponent.rotation} onChange={onChangeRotation} unit="°" />
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
