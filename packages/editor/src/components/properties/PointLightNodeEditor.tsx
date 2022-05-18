// @ts-nocheck

import React from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ColorInput from '../inputs/ColorInput'
import NumericInputGroup from '../inputs/NumericInputGroup'
import LightShadowProperties from './LightShadowProperties'
import { Lightbulb } from '@styled-icons/fa-solid/Lightbulb'
import { useTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'

//Declaring properties for PointLightNodeEditor
type PointLightNodeEditorProps = {
  node?: object
}

/**
 * PointLightNodeEditor is used render editor view to customize component properties.
 *
 * @author Robert Long
 * @type {class component}
 */
export const PointLightNodeEditor = (props: PointLightNodeEditorProps) => {
  const { t } = useTranslation()

  //function to handle changes in color property
  const onChangeColor = (color) => {
    CommandManager.instance.setPropertyOnSelection('color', color)
  }

  //function to handle changes in intensity
  const onChangeIntensity = (intensity) => {
    CommandManager.instance.setPropertyOnSelection('intensity', intensity)
  }

  //function to handle changes on range property
  const onChangeRange = (range) => {
    CommandManager.instance.setPropertyOnSelection('range', range)
  }

  //rendering editor view
  const { node } = props
  return (
    <NodeEditor {...props} description={t('editor:properties.pointLight.description')}>
      <InputGroup name="Color" label={t('editor:properties.pointLight.lbl-color')}>
        <ColorInput value={node.color} onChange={onChangeColor} />
      </InputGroup>
      <NumericInputGroup
        name="Intensity"
        label={t('editor:properties.pointLight.lbl-intensity')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={node.intensity}
        onChange={onChangeIntensity}
        unit="cd"
      />
      <NumericInputGroup
        name="Range"
        label={t('editor:properties.pointLight.lbl-range')}
        min={0}
        smallStep={0.1}
        mediumStep={1}
        largeStep={10}
        value={node.range}
        onChange={onChangeRange}
        unit="m"
      />
      <LightShadowProperties node={node} />
    </NodeEditor>
  )
}

PointLightNodeEditor.iconComponent = Lightbulb

export default PointLightNodeEditor
