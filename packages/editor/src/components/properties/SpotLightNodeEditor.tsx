import React, { Component } from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ColorInput from '../inputs/ColorInput'
import NumericInputGroup from '../inputs/NumericInputGroup'
import RadianNumericInputGroup from '../inputs/RadianNumericInputGroup'
import { MathUtils as _Math } from 'three'
import LightShadowProperties from './LightShadowProperties'
import { Bullseye } from '@styled-icons/fa-solid/Bullseye'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'
const radToDeg = _Math.radToDeg

/**
 * SpotLightNodeEditorProps declaring SpotLightNodeEditor properties.
 *
 * @author Robert Long
 * @type {Object}
 */
type SpotLightNodeEditorProps = {
  node?: object
  multiEdit?: boolean
  t: Function
}

/**
 * SpotLightNodeEditor component class used to provide editor view for property customization.
 *
 *  @author Robert Long
 *  @type {class component}
 */
export class SpotLightNodeEditor extends Component<SpotLightNodeEditorProps, {}> {
  //initializing iconComponent with icon name
  static iconComponent = Bullseye

  //initializing description and will appear on the editor view
  static description = i18n.t('editor:properties.spotLight.description')

  //function to handle the changes in color property
  onChangeColor = (color) => {
    CommandManager.instance.setPropertyOnSelection('color', color)
  }

  //function to handle the changes in intensity property
  onChangeIntensity = (intensity) => {
    CommandManager.instance.setPropertyOnSelection('intensity', intensity)
  }

  //function to handle the changes innerConeAngle property
  onChangeInnerConeAngle = (innerConeAngle) => {
    CommandManager.instance.setPropertyOnSelection('innerConeAngle', innerConeAngle)
  }

  //function to handle the changes in outerConeAngle property
  onChangeOuterConeAngle = (outerConeAngle) => {
    CommandManager.instance.setPropertyOnSelection('outerConeAngle', outerConeAngle)
  }

  //function to handle the changes in ranges property
  onChangeRange = (range) => {
    CommandManager.instance.setPropertyOnSelection('range', range)
  }

  //rendering editor view
  render() {
    SpotLightNodeEditor.description = this.props.t('editor:properties.spotLight.description')
    const { node } = this.props as any
    return (
      <NodeEditor {...this.props} description={SpotLightNodeEditor.description}>
        <InputGroup name="Color" label={this.props.t('editor:properties.spotLight.lbl-color')}>
          <ColorInput value={node.color} onChange={this.onChangeColor} />
        </InputGroup>
        <NumericInputGroup
          name="Intensity"
          label={this.props.t('editor:properties.spotLight.lbl-intensity')}
          min={0}
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={node.intensity}
          onChange={this.onChangeIntensity}
          unit="°"
        />
        <RadianNumericInputGroup
          name="Inner Cone Angle"
          label={this.props.t('editor:properties.spotLight.lbl-innerConeAngle')}
          min={0}
          max={radToDeg(node.outerConeAngle)}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={node.innerConeAngle}
          onChange={this.onChangeInnerConeAngle}
          unit="°"
        />
        <RadianNumericInputGroup
          name="Outer Cone Angle"
          label={this.props.t('editor:properties.spotLight.lbl-outerConeAngle')}
          min={radToDeg(node.innerConeAngle + 0.00001)}
          max={radToDeg(node.maxOuterConeAngle)}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={node.outerConeAngle}
          onChange={this.onChangeOuterConeAngle}
          unit="°"
        />
        <NumericInputGroup
          name="Range"
          label={this.props.t('editor:properties.spotLight.lbl-range')}
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

export default withTranslation()(SpotLightNodeEditor)
