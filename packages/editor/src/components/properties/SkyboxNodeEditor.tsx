import { Cloud } from '@styled-icons/fa-solid/Cloud'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { SkyboxComponent } from '@xrengine/engine/src/scene/components/SkyboxComponent'
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
    label: 'Color',
    value: SkyTypeEnum.COLOR
  },
  {
    label: 'Skybox',
    value: SkyTypeEnum.SKYBOX
  },
  {
    label: 'Cubemap',
    value: SkyTypeEnum.CUBEMAP
  },
  {
    label: 'Equirectangular',
    value: SkyTypeEnum.EQUIRECTANGULAR
  }
]

/**
 * SkyboxNodeEditorProps declaring props for SkyboxNodeEditor.
 *
 * @author Robert Long
 * @type {Object}
 */
type SkyboxNodeEditorProps = {
  node?: any
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
    // CommandManager.instance.setPropertyOnSelection('turbidity', turbidity)
    const skyboxComponent = getComponent(this.props.node.eid, SkyboxComponent)
    skyboxComponent.turbidity = turbidity
    this.forceUpdate()
  }

  //function to handle changes in rayleigh property
  onChangeRayleigh = (rayleigh) => {
    // CommandManager.instance.setPropertyOnSelection('rayleigh', rayleigh)
    const skyboxComponent = getComponent(this.props.node.eid, SkyboxComponent)
    skyboxComponent.rayleigh = rayleigh
    this.forceUpdate()
  }

  //function to handle the changes in luminance property
  onChangeLuminance = (luminance) => {
    // CommandManager.instance.setPropertyOnSelection('luminance', luminance)
    const skyboxComponent = getComponent(this.props.node.eid, SkyboxComponent)
    skyboxComponent.luminance = luminance
    this.forceUpdate()
  }

  //function to handle the changes in mieCoefficient property
  onChangeMieCoefficient = (mieCoefficient) => {
    // CommandManager.instance.setPropertyOnSelection('mieCoefficient', mieCoefficient)
    const skyboxComponent = getComponent(this.props.node.eid, SkyboxComponent)
    skyboxComponent.mieCoefficient = mieCoefficient
    this.forceUpdate()
  }

  //function to handle the changes in mieDirectionalG property
  onChangeMieDirectionalG = (mieDirectionalG) => {
    // CommandManager.instance.setPropertyOnSelection('mieDirectionalG', mieDirectionalG)
    const skyboxComponent = getComponent(this.props.node.eid, SkyboxComponent)
    skyboxComponent.mieDirectionalG = mieDirectionalG
    this.forceUpdate()
  }

  //function to handle the changes in inclination
  onChangeInclination = (inclination) => {
    // CommandManager.instance.setPropertyOnSelection('inclination', inclination)
    const skyboxComponent = getComponent(this.props.node.eid, SkyboxComponent)
    skyboxComponent.inclination = inclination
    this.forceUpdate()
  }

  //function to handle changes azimuth
  onChangeAzimuth = (azimuth) => {
    // CommandManager.instance.setPropertyOnSelection('azimuth', azimuth)
    const skyboxComponent = getComponent(this.props.node.eid, SkyboxComponent)
    skyboxComponent.azimuth = azimuth
    this.forceUpdate()
  }

  //function to handle changes in distance property
  onChangeDistance = (distance) => {
    CommandManager.instance.setPropertyOnSelection('distance', distance)
  }

  //function to handle the changes skyType
  onChangeSkyOption = (backgroundType) => {
    // CommandManager.instance.setPropertyOnSelection('backgroundType', backgroundType)
    const skyboxComponent = getComponent(this.props.node.eid, SkyboxComponent)
    skyboxComponent.backgroundType = backgroundType
    this.forceUpdate()
  }

  //function to handle the changes backgroundPath
  onChangeEquirectangularPathOption = (path) => {
    // CommandManager.instance.setPropertyOnSelection('equirectangularPath', path)
    const skyboxComponent = getComponent(this.props.node.eid, SkyboxComponent)
    skyboxComponent.equirectangularPath = path
    this.forceUpdate()
  }

  onChangeCubemapPathOption = (path) => {
    // CommandManager.instance.setPropertyOnSelection('cubemapPath', path)
    const skyboxComponent = getComponent(this.props.node.eid, SkyboxComponent)
    skyboxComponent.cubemapPath = path
    this.forceUpdate()
  }

  //function to handle the changes backgroundPath
  onChangeColorOption = (backgroundColor) => {
    // CommandManager.instance.setPropertyOnSelection('backgroundColor', backgroundColor)
    const skyboxComponent = getComponent(this.props.node.eid, SkyboxComponent)
    skyboxComponent.backgroundColor = backgroundColor
    this.forceUpdate()
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
          value={node.backgroundColor}
          onChange={this.onChangeColorOption}
          isValueAsInteger={true}
        />
      </InputGroup>
    </>
  )

  // creating editor view for skybox Properties
  renderSkyBoxProps = (node) => {
    switch (node.backgroundType) {
      case SkyTypeEnum.EQUIRECTANGULAR as any:
        return this.renderTextureSettings((node as any).equirectangularPath, this.onChangeEquirectangularPathOption)
      case SkyTypeEnum.CUBEMAP as any:
        return this.renderTextureSettings((node as any).cubemapPath, this.onChangeCubemapPathOption)
      case SkyTypeEnum.COLOR as any:
        return this.renderColorSettings(node)
      default:
        return this.renderSkyboxSettings(node)
    }
  }

  // rendering editor view for SkyboxNode
  render() {
    SkyboxNodeEditor.description = this.props.t('editor:properties.skybox.description')
    const skyboxComponent = getComponent(this.props.node.eid, SkyboxComponent)
    return (
      <NodeEditor description={SkyboxNodeEditor.description} {...this.props}>
        <InputGroup name="Sky Type" label={this.props.t('editor:properties.skybox.lbl-skyType')}>
          <SelectInput options={SkyOption} value={skyboxComponent.backgroundType} onChange={this.onChangeSkyOption} />
        </InputGroup>
        {this.renderSkyBoxProps(skyboxComponent)}
      </NodeEditor>
    )
  }
}

export default withTranslation()(SkyboxNodeEditor)
