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
const SpotLightNodeEditor = (props: SpotLightNodeEditorProps) => {
  //function to handle the changes in color property
  const onChangeColor = (color) => {
    CommandManager.instance.setPropertyOnSelection('color', color)
  }

  //function to handle the changes in intensity property
  const onChangeIntensity = (intensity) => {
    CommandManager.instance.setPropertyOnSelection('intensity', intensity)
  }

  //function to handle the changes innerConeAngle property
  const onChangeInnerConeAngle = (innerConeAngle) => {
    CommandManager.instance.setPropertyOnSelection('innerConeAngle', innerConeAngle)
  }

  //function to handle the changes in outerConeAngle property
  const onChangeOuterConeAngle = (outerConeAngle) => {
    CommandManager.instance.setPropertyOnSelection('outerConeAngle', outerConeAngle)
  }

  //function to handle the changes in ranges property
  const onChangeRange = (range) => {
    CommandManager.instance.setPropertyOnSelection('range', range)
  }

  //rendering editor view
  const { node } = props
  return (
    <NodeEditor {...props} description={SpotLightNodeEditor.description}>
      <InputGroup name="Color" label={props.t('editor:properties.spotLight.lbl-color')}>
        <ColorInput value={node.color} onChange={onChangeColor} />
      </InputGroup>
      <NumericInputGroup
        name="Intensity"
        label={props.t('editor:properties.spotLight.lbl-intensity')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={node.intensity}
        onChange={onChangeIntensity}
        unit="°"
      />
      <RadianNumericInputGroup
        name="Inner Cone Angle"
        label={props.t('editor:properties.spotLight.lbl-innerConeAngle')}
        min={0}
        max={radToDeg(node.outerConeAngle)}
        smallStep={0.1}
        mediumStep={1}
        largeStep={10}
        value={node.innerConeAngle}
        onChange={onChangeInnerConeAngle}
        unit="°"
      />
      <RadianNumericInputGroup
        name="Outer Cone Angle"
        label={props.t('editor:properties.spotLight.lbl-outerConeAngle')}
        min={radToDeg(node.innerConeAngle + 0.00001)}
        max={radToDeg(node.maxOuterConeAngle)}
        smallStep={0.1}
        mediumStep={1}
        largeStep={10}
        value={node.outerConeAngle}
        onChange={onChangeOuterConeAngle}
        unit="°"
      />
      <NumericInputGroup
        name="Range"
        label={props.t('editor:properties.spotLight.lbl-range')}
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

SpotLightNodeEditor.iconComponent = Bullseye
SpotLightNodeEditor.description = i18n.t('editor:properties.spotLight.description')

export default withTranslation()(SpotLightNodeEditor)
