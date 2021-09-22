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
}

/**
 *
 * AmbientLightNodeEditor component used to customize the ambient light element on the scene
 * ambient light is basically used to illuminates all the objects present inside the scene.
 *
 * @author Robert Long
 * @type {[component class]}
 */
export class AmbientLightNodeEditor extends Component<AmbientLightNodeEditorProps, {}> {
  //iconComponent used to show icon image on the ambient light element
  static iconComponent = Sun
  static description = i18n.t('editor:properties.ambientLight.description')

  // used to change the color property of selected scene, when we change color property of ambient light
  onChangeColor = (color) => {
    CommandManager.instance.setPropertyOnSelection('color', color)
  }
  // used to change the intensity of selected scene
  onChangeIntensity = (intensity) => {
    CommandManager.instance.setPropertyOnSelection('intensity', intensity)
  }

  /**
   * Rendering ambient light view to customize ambient light element.
   *
   * @author Robert Long
   */
  render() {
    AmbientLightNodeEditor.description = this.props.t('editor:properties.ambientLight.description')
    const node = this.props.node
    return (
      <NodeEditor {...this.props} description={AmbientLightNodeEditor.description}>
        <InputGroup name="Color" label={this.props.t('editor:properties.ambientLight.lbl-color')}>
          <ColorInput value={node.color} onChange={this.onChangeColor} />
        </InputGroup>
        <NumericInputGroup
          name="Intensity"
          label={this.props.t('editor:properties.ambientLight.lbl-intensity')}
          min={0}
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={node.intensity}
          onChange={this.onChangeIntensity}
          unit="cd"
        />
      </NodeEditor>
    )
  }
}

export default withTranslation()(AmbientLightNodeEditor)
