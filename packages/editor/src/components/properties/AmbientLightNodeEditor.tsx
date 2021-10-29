import React, { Component } from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ColorInput from '../inputs/ColorInput'
import NumericInputGroup from '../inputs/NumericInputGroup'
import { Sun } from '@styled-icons/fa-solid/Sun'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'

type AmbientLightNodeEditorProps = {
  node?: any
  t: Function
  description: string
}

/**
 *
 * AmbientLightNodeEditor component used to customize the ambient light element on the scene
 * ambient light is basically used to illuminates all the objects present inside the scene.
 *
 * @author Robert Long
 * @type {[component class]}
 */
const AmbientLightNodeEditor = (props: AmbientLightNodeEditorProps) => {
  const node = props.node

  // used to change the color property of selected scene, when we change color property of ambient light
  const onChangeColor = (color) => {
    CommandManager.instance.setPropertyOnSelection('color', color)
  }

  // used to change the intensity of selected scene
  const onChangeIntensity = (intensity) => {
    CommandManager.instance.setPropertyOnSelection('intensity', intensity)
  }

  return (
    <NodeEditor {...props} description={props.t('editor:properties.ambientLight.description')}>
      <InputGroup name="Color" label={props.t('editor:properties.ambientLight.lbl-color')}>
        <ColorInput value={node.color} onChange={onChangeColor} />
      </InputGroup>
      <NumericInputGroup
        name="Intensity"
        label={props.t('editor:properties.ambientLight.lbl-intensity')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={node.intensity}
        onChange={onChangeIntensity}
        unit="cd"
      />
    </NodeEditor>
  )
}

AmbientLightNodeEditor.iconComponent = Sun

export default withTranslation()(AmbientLightNodeEditor)
