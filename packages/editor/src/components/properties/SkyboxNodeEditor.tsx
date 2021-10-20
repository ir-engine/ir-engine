import { Cloud } from '@styled-icons/fa-solid/Cloud'
import { SkyTypeEnum } from '@xrengine/engine/src/scene/constants/SkyBoxShaderProps'
import i18n from 'i18next'
import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'
import ColorInput from '../inputs/ColorInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import RadianNumericInputGroup from '../inputs/RadianNumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import { ControlledStringInput } from '../inputs/StringInput'
import NodeEditor from './NodeEditor'

const hoursToRadians = (hours) => hours / 24
const radiansToHours = (rads) => rads * 24

/**
 * Types of skyboxes
 *
 * @author Robert Long
 * @type {Array}
 */
const SkyOption = [
  {
    label: 'color',
    value: SkyTypeEnum.color
  },
  {
    label: 'skybox',
    value: SkyTypeEnum.skybox
  },
  {
    label: 'cubemap',
    value: SkyTypeEnum.cubemap
  },
  {
    label: 'equirectangular',
    value: SkyTypeEnum.equirectangular
  }
]

/**
 * SkyboxNodeEditorProps declaring props for SkyboxNodeEditor.
 *
 * @author Robert Long
 * @type {Object}
 */
type SkyboxNodeEditorProps = {
  node?: object
  t: Function
}

/**
 * SkyboxNodeEditor component class used to render editor view to customize component property.
 *
 * @author Robert Long
 * @type {class component}
 */
export class SkyboxNodeEditor extends Component<SkyboxNodeEditorProps, {}> {
  //defining iconComponent with icon name
  static iconComponent = Cloud
  static description = i18n.t('editor:properties.skybox.description')

  //function to handle changes in turbidity Property
  onChangeTurbidity = (turbidity) => {
    CommandManager.instance.setPropertyOnSelection('turbidity', turbidity)
  }

  //function to handle changes in rayleigh property
  onChangeRayleigh = (rayleigh) => {
    CommandManager.instance.setPropertyOnSelection('rayleigh', rayleigh)
  }

  //function to handle the changes in luminance property
  onChangeLuminance = (luminance) => {
    CommandManager.instance.setPropertyOnSelection('luminance', luminance)
  }

  //function to handle the changes in mieCoefficient property
  onChangeMieCoefficient = (mieCoefficient) => {
    CommandManager.instance.setPropertyOnSelection('mieCoefficient', mieCoefficient)
  }

  //function to handle the changes in mieDirectionalG property
  onChangeMieDirectionalG = (mieDirectionalG) => {
    CommandManager.instance.setPropertyOnSelection('mieDirectionalG', mieDirectionalG)
  }

  //function to handle the changes in inclination
  onChangeInclination = (inclination) => {
    CommandManager.instance.setPropertyOnSelection('inclination', inclination)
  }

  //function to handle changes azimuth
  onChangeAzimuth = (azimuth) => {
    CommandManager.instance.setPropertyOnSelection('azimuth', azimuth)
  }

  //function to handle changes in distance property
  onChangeDistance = (distance) => {
    CommandManager.instance.setPropertyOnSelection('distance', distance)
  }

  //function to handle the changes skyType
  onChangeSkyOption = (backgroundType) => {
    CommandManager.instance.setPropertyOnSelection('backgroundType', backgroundType)
  }

  //function to handle the changes backgroundPath
  onChangeEquirectangularPathOption = (path) => {
    CommandManager.instance.setPropertyOnSelection('equirectangularPath', path)
  }

  onChangeCubemapPathOption = (path) => {
    CommandManager.instance.setPropertyOnSelection('cubemapPath', path)
  }

  //function to handle the changes backgroundPath
  onChangeColorOption = (backgroundColor) => {
    CommandManager.instance.setPropertyOnSelection('backgroundColor', backgroundColor)
  }

  //creating editor view for skybox setting
  renderSkyboxSettings = (node) => (
    <>
      <NumericInputGroup
        name="Time of Day"
        label={this.props.t('editor:properties.skybox.lbl-timeOfDay')}
        smallStep={0.1}
        mediumStep={0.5}
        largeStep={1}
        min={0}
        max={24}
        convertFrom={radiansToHours}
        convertTo={hoursToRadians}
        value={node.azimuth}
        onChange={this.onChangeAzimuth}
        unit="h"
      />
      <RadianNumericInputGroup
        name="Latitude"
        label={this.props.t('editor:properties.skybox.lbl-latitude')}
        min={-90}
        max={90}
        smallStep={0.1}
        mediumStep={0.5}
        largeStep={1}
        value={node.inclination}
        onChange={this.onChangeInclination}
      />
      <InputGroup name="Luminance" label={this.props.t('editor:properties.skybox.lbl-luminance')}>
        <CompoundNumericInput
          min={0.001}
          max={1.189}
          step={0.001}
          value={node.luminance}
          onChange={this.onChangeLuminance}
        />
      </InputGroup>
      <InputGroup name="Scattering Amount" label={this.props.t('editor:properties.skybox.lbl-scattering')}>
        <CompoundNumericInput
          min={0}
          max={0.1}
          step={0.001}
          value={node.mieCoefficient}
          onChange={this.onChangeMieCoefficient}
        />
      </InputGroup>
      <InputGroup name="Scattering Distance" label={this.props.t('editor:properties.skybox.lbl-scatteringDistance')}>
        <CompoundNumericInput
          min={0}
          max={1}
          step={0.001}
          value={node.mieDirectionalG}
          onChange={this.onChangeMieDirectionalG}
        />
      </InputGroup>
      <InputGroup name="Horizon Start" label={this.props.t('editor:properties.skybox.lbl-horizonStart')}>
        <CompoundNumericInput min={1} max={20} value={node.turbidity} onChange={this.onChangeTurbidity} />
      </InputGroup>
      <InputGroup name="Horizon End" label={this.props.t('editor:properties.skybox.lbl-horizonEnd')}>
        <CompoundNumericInput min={0} max={4} value={node.rayleigh} onChange={this.onChangeRayleigh} />
      </InputGroup>
    </>
  )

  // creating editor view for cubemap Settings
  renderTextureSettings = (value, onChange) => (
    <>
      <InputGroup name="Texture" label={this.props.t('editor:properties.skybox.lbl-texture')}>
        <ControlledStringInput value={value} onChange={onChange} />
      </InputGroup>
    </>
  )

  // creating editor view for color Settings
  renderColorSettings = (node) => (
    <>
      <InputGroup name="Color" label={this.props.t('editor:properties.skybox.lbl-color')}>
        <ColorInput
          value={(node as any).backgroundColor ? (node as any).backgroundColor : 0x000000}
          onChange={this.onChangeColorOption}
          isValueAsInteger={true}
        />
      </InputGroup>
    </>
  )

  // creating editor view for skybox Properties
  renderSkyBoxProps = (node) => {
    switch (node.backgroundType) {
      case SkyTypeEnum.equirectangular as any:
        return this.renderTextureSettings((node as any).equirectangularPath, this.onChangeEquirectangularPathOption)
      case SkyTypeEnum.cubemap as any:
        return this.renderTextureSettings((node as any).cubemapPath, this.onChangeCubemapPathOption)
      case SkyTypeEnum.color as any:
        return this.renderColorSettings(node)
      default:
        return this.renderSkyboxSettings(node)
    }
  }

  // rendering editor view for SkyboxNode
  render() {
    SkyboxNodeEditor.description = this.props.t('editor:properties.skybox.description')
    const node = this.props.node as any
    return (
      <NodeEditor description={SkyboxNodeEditor.description} {...this.props}>
        <InputGroup name="Sky Type" label={this.props.t('editor:properties.skybox.lbl-skyType')}>
          <SelectInput options={SkyOption} value={(node as any).backgroundType} onChange={this.onChangeSkyOption} />
        </InputGroup>
        {this.renderSkyBoxProps(node)}
      </NodeEditor>
    )
  }
}

export default withTranslation()(SkyboxNodeEditor)
