import React from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ColorInput from '../inputs/ColorInput'
import NumericInputGroup from '../inputs/NumericInputGroup'
import { Certificate } from '@styled-icons/fa-solid/Certificate'
import { useTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { HemisphereLightComponent } from '@xrengine/engine/src/scene/components/HemisphereLightComponent'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'

type HemisphereLightNodeEditorProps = {
  node: EntityTreeNode
}

/**
 * HemisphereLightNodeEditor used to provide property customization view for HemisphereLightNode.
 *
 * @author Robert Long
 * @type {class Compoment}
 */
export const HemisphereLightNodeEditor = (props: HemisphereLightNodeEditorProps) => {
  const { t } = useTranslation()

  //function handle change in skyColor property
  const onChangeSkyColor = (skyColor) => {
    CommandManager.instance.setPropertyOnSelectionEntities(HemisphereLightComponent, 'skyColor', skyColor)
  }

  //function to handle changes in ground property
  const onChangeGroundColor = (groundColor) => {
    CommandManager.instance.setPropertyOnSelectionEntities(HemisphereLightComponent, 'groundColor', groundColor)
  }

  //function to handle changes in intensity property
  const onChangeIntensity = (intensity) => {
    CommandManager.instance.setPropertyOnSelectionEntities(HemisphereLightComponent, 'intensity', intensity)
  }

  //renders view to customize HemisphereLightNode
  const lightComponent = getComponent(props.node.entity, HemisphereLightComponent)

  return (
    <NodeEditor {...props} description={t('editor:properties.hemisphere.description')}>
      <InputGroup name="Sky Color" label={t('editor:properties.hemisphere.lbl-skyColor')}>
        <ColorInput value={lightComponent.skyColor} onChange={onChangeSkyColor} />
      </InputGroup>
      <InputGroup name="Ground Color" label={t('editor:properties.hemisphere.lbl-groundColor')}>
        <ColorInput value={lightComponent.groundColor} onChange={onChangeGroundColor} />
      </InputGroup>
      <NumericInputGroup
        name="Intensity"
        label={t('editor:properties.hemisphere.lbl-intensity')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={lightComponent.intensity}
        onChange={onChangeIntensity}
        unit="cd"
      />
    </NodeEditor>
  )
}

HemisphereLightNodeEditor.iconComponent = Certificate

export default HemisphereLightNodeEditor
