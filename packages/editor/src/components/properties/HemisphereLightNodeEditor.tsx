import React, { useState, useCallback } from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ColorInput from '../inputs/ColorInput'
import NumericInputGroup from '../inputs/NumericInputGroup'
import { Certificate } from '@styled-icons/fa-solid/Certificate'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import { HemisphereLightComponent } from '@xrengine/engine/src/scene/components/HemisphereLightComponent'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
type HemisphereLightNodeEditorProps = {
  node?: any
  t: Function
}

/**
 * HemisphereLightNodeEditor used to provide property customization view for HemisphereLightNode.
 *
 * @author Robert Long
 * @type {class Compoment}
 */
const HemisphereLightNodeEditor = (props: HemisphereLightNodeEditorProps) => {
  const [, updateState] = useState()

  const forceUpdate = useCallback(() => updateState({}), [])

  //function handle change in skyColor property
  const onChangeSkyColor = (skyColor) => {
    // CommandManager.instance.setPropertyOnSelection('skyColor', skyColor)
    const hemisphereLightComponent = getComponent(props.node.eid, HemisphereLightComponent)
    hemisphereLightComponent.skyColor = skyColor
    forceUpdate()
  }

  //function to handle changes in ground property
  const onChangeGroundColor = (groundColor) => {
    // CommandManager.instance.setPropertyOnSelection('groundColor', groundColor)
    const hemisphereLightComponent = getComponent(props.node.eid, HemisphereLightComponent)
    hemisphereLightComponent.groundColor = groundColor
    forceUpdate()
  }

  //function to handle changes in intensity property
  const onChangeIntensity = (intensity) => {
    // CommandManager.instance.setPropertyOnSelection('intensity', intensity)
    const hemisphereLightComponent = getComponent(props.node.eid, HemisphereLightComponent)
    hemisphereLightComponent.intensity = intensity
    forceUpdate()
  }

  //renders view to customize HemisphereLightNode
  const hemisphereLightComponent = getComponent(props.node.eid, HemisphereLightComponent)

  return (
    <NodeEditor {...props} description={HemisphereLightNodeEditor.description}>
      <InputGroup name="Sky Color" label={props.t('editor:properties.hemisphere.lbl-skyColor')}>
        <ColorInput value={hemisphereLightComponent.skyColor} onChange={onChangeSkyColor} />
      </InputGroup>
      <InputGroup name="Ground Color" label={props.t('editor:properties.hemisphere.lbl-groundColor')}>
        <ColorInput value={hemisphereLightComponent.groundColor} onChange={onChangeGroundColor} />
      </InputGroup>
      <NumericInputGroup
        name="Intensity"
        label={props.t('editor:properties.hemisphere.lbl-intensity')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={hemisphereLightComponent.intensity}
        onChange={onChangeIntensity}
        unit="cd"
      />
    </NodeEditor>
  )
}

HemisphereLightNodeEditor.iconComponent = Certificate
HemisphereLightNodeEditor.description = i18n.t('editor:properties.hemisphere.description')

export default withTranslation()(HemisphereLightNodeEditor)
