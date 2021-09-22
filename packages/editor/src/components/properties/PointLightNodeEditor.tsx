// @ts-nocheck

import React, { Component } from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ColorInput from '../inputs/ColorInput'
import NumericInputGroup from '../inputs/NumericInputGroup'
import LightShadowProperties from './LightShadowProperties'
import { Lightbulb } from '@styled-icons/fa-solid/Lightbulb'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'

//Declaring properties for PointLightNodeEditor
type PointLightNodeEditorProps = {
  node?: object
  t: Function
}

/**
 * PointLightNodeEditor is used render editor view to customize component properties.
 *
 * @author Robert Long
 * @type {class component}
 */
export class PointLightNodeEditor extends Component<PointLightNodeEditorProps, {}> {
  //initializing iconComponent icon name
  static iconComponent = Lightbulb

  //initializing description will appears on editor view
  static description = i18n.t('editor:properties.pointLight.description')

  //function to handle changes in color property
  onChangeColor = (color) => {
    CommandManager.instance.setPropertyOnSelection('color', color)
  }

  //function to handle changes in intensity
  onChangeIntensity = (intensity) => {
    CommandManager.instance.setPropertyOnSelection('intensity', intensity)
  }

  //function to handle changes on range property
  onChangeRange = (range) => {
    CommandManager.instance.setPropertyOnSelection('range', range)
  }

  //rendering editor view
  render() {
    PointLightNodeEditor.description = this.props.t('editor:properties.pointLight.description')
    const { node } = this.props as any
    return (
      <NodeEditor {...this.props} description={PointLightNodeEditor.description}>
        <InputGroup name="Color" label={this.props.t('editor:properties.pointLight.lbl-color')}>
          <ColorInput value={node.color} onChange={this.onChangeColor} />
        </InputGroup>
        <NumericInputGroup
          name="Intensity"
          label={this.props.t('editor:properties.pointLight.lbl-intensity')}
          min={0}
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={node.intensity}
          onChange={this.onChangeIntensity}
          unit="cd"
        />
        <NumericInputGroup
          name="Range"
          label={this.props.t('editor:properties.pointLight.lbl-range')}
          min={0}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={node.range}
          onChange={this.onChangeRange}
          unit="m"
        />
        <LightShadowProperties node={node} />
      </NodeEditor>
    )
  }
}

export default withTranslation()(PointLightNodeEditor)
