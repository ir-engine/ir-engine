import { Cloud } from '@styled-icons/fa-solid/Cloud'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { SkyboxComponent } from '@xrengine/engine/src/scene/components/SkyboxComponent'
import { SkyTypeEnum } from '@xrengine/engine/src/scene/constants/SkyBoxShaderProps'
import i18n from 'i18next'
import React, { useCallback, useState } from 'react'
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
const SkyboxNodeEditor = (props: SkyboxNodeEditorProps) => {
  const [, updateState] = useState()

  const forceUpdate = useCallback(() => updateState({}), [])

  //function to handle changes in turbidity Property
  const onChangeTurbidity = (turbidity) => {
    // CommandManager.instance.setPropertyOnSelection('turbidity', turbidity)
    const skyboxComponent = getComponent(props.node.eid, SkyboxComponent)
    skyboxComponent.turbidity = turbidity
    forceUpdate()
  }

  //function to handle changes in rayleigh property
  const onChangeRayleigh = (rayleigh) => {
    // CommandManager.instance.setPropertyOnSelection('rayleigh', rayleigh)
    const skyboxComponent = getComponent(props.node.eid, SkyboxComponent)
    skyboxComponent.rayleigh = rayleigh
    forceUpdate()
  }

  //function to handle the changes in luminance property
  const onChangeLuminance = (luminance) => {
    // CommandManager.instance.setPropertyOnSelection('luminance', luminance)
    const skyboxComponent = getComponent(props.node.eid, SkyboxComponent)
    skyboxComponent.luminance = luminance
    forceUpdate()
  }

  //function to handle the changes in mieCoefficient property
  const onChangeMieCoefficient = (mieCoefficient) => {
    // CommandManager.instance.setPropertyOnSelection('mieCoefficient', mieCoefficient)
    const skyboxComponent = getComponent(props.node.eid, SkyboxComponent)
    skyboxComponent.mieCoefficient = mieCoefficient
    forceUpdate()
  }

  //function to handle the changes in mieDirectionalG property
  const onChangeMieDirectionalG = (mieDirectionalG) => {
    // CommandManager.instance.setPropertyOnSelection('mieDirectionalG', mieDirectionalG)
    const skyboxComponent = getComponent(props.node.eid, SkyboxComponent)
    skyboxComponent.mieDirectionalG = mieDirectionalG
    forceUpdate()
  }

  //function to handle the changes in inclination
  const onChangeInclination = (inclination) => {
    // CommandManager.instance.setPropertyOnSelection('inclination', inclination)
    const skyboxComponent = getComponent(props.node.eid, SkyboxComponent)
    skyboxComponent.inclination = inclination
    forceUpdate()
  }

  //function to handle changes azimuth
  const onChangeAzimuth = (azimuth) => {
    // CommandManager.instance.setPropertyOnSelection('azimuth', azimuth)
    const skyboxComponent = getComponent(props.node.eid, SkyboxComponent)
    skyboxComponent.azimuth = azimuth
    forceUpdate()
  }

  //function to handle changes in distance property
  const onChangeDistance = (distance) => {
    CommandManager.instance.setPropertyOnSelection('distance', distance)
  }

  //function to handle the changes skyType
  const onChangeSkyOption = (backgroundType) => {
    // CommandManager.instance.setPropertyOnSelection('backgroundType', backgroundType)
    const skyboxComponent = getComponent(props.node.eid, SkyboxComponent)
    skyboxComponent.backgroundType = backgroundType
    forceUpdate()
  }

  //function to handle the changes backgroundPath
  const onChangeEquirectangularPathOption = (path) => {
    // CommandManager.instance.setPropertyOnSelection('equirectangularPath', path)
    const skyboxComponent = getComponent(props.node.eid, SkyboxComponent)
    skyboxComponent.equirectangularPath = path
    forceUpdate()
  }

  const onChangeCubemapPathOption = (path) => {
    // CommandManager.instance.setPropertyOnSelection('cubemapPath', path)
    const skyboxComponent = getComponent(props.node.eid, SkyboxComponent)
    skyboxComponent.cubemapPath = path
    forceUpdate()
  }

  //function to handle the changes backgroundPath
  const onChangeColorOption = (backgroundColor) => {
    // CommandManager.instance.setPropertyOnSelection('backgroundColor', backgroundColor)
    const skyboxComponent = getComponent(props.node.eid, SkyboxComponent)
    skyboxComponent.backgroundColor = backgroundColor
    forceUpdate()
  }

  //creating editor view for skybox setting
  const renderSkyboxSettings = (node) => (
    <>
      <NumericInputGroup
        name="Time of Day"
        label={props.t('editor:properties.skybox.lbl-timeOfDay')}
        smallStep={0.1}
        mediumStep={0.5}
        largeStep={1}
        min={0}
        max={24}
        convertFrom={radiansToHours}
        convertTo={hoursToRadians}
        value={node.azimuth}
        onChange={onChangeAzimuth}
        unit="h"
      />
      <RadianNumericInputGroup
        name="Latitude"
        label={props.t('editor:properties.skybox.lbl-latitude')}
        min={-90}
        max={90}
        smallStep={0.1}
        mediumStep={0.5}
        largeStep={1}
        value={node.inclination}
        onChange={onChangeInclination}
      />
      <InputGroup name="Luminance" label={props.t('editor:properties.skybox.lbl-luminance')}>
        <CompoundNumericInput
          min={0.001}
          max={1.189}
          step={0.001}
          value={node.luminance}
          onChange={onChangeLuminance}
        />
      </InputGroup>
      <InputGroup name="Scattering Amount" label={props.t('editor:properties.skybox.lbl-scattering')}>
        <CompoundNumericInput
          min={0}
          max={0.1}
          step={0.001}
          value={node.mieCoefficient}
          onChange={onChangeMieCoefficient}
        />
      </InputGroup>
      <InputGroup name="Scattering Distance" label={props.t('editor:properties.skybox.lbl-scatteringDistance')}>
        <CompoundNumericInput
          min={0}
          max={1}
          step={0.001}
          value={node.mieDirectionalG}
          onChange={onChangeMieDirectionalG}
        />
      </InputGroup>
      <InputGroup name="Horizon Start" label={props.t('editor:properties.skybox.lbl-horizonStart')}>
        <CompoundNumericInput min={1} max={20} value={node.turbidity} onChange={onChangeTurbidity} />
      </InputGroup>
      <InputGroup name="Horizon End" label={props.t('editor:properties.skybox.lbl-horizonEnd')}>
        <CompoundNumericInput min={0} max={4} value={node.rayleigh} onChange={onChangeRayleigh} />
      </InputGroup>
    </>
  )

  // creating editor view for cubemap Settings
  const renderTextureSettings = (value, onChange) => (
    <>
      <InputGroup name="Texture" label={props.t('editor:properties.skybox.lbl-texture')}>
        <ControlledStringInput value={value} onChange={onChange} />
      </InputGroup>
    </>
  )

  // creating editor view for color Settings
  const renderColorSettings = (node) => (
    <>
      <InputGroup name="Color" label={props.t('editor:properties.skybox.lbl-color')}>
        <ColorInput value={node.backgroundColor} onChange={onChangeColorOption} isValueAsInteger={true} />
      </InputGroup>
    </>
  )

  // creating editor view for skybox Properties
  const renderSkyBoxProps = (node) => {
    switch (node.backgroundType) {
      case SkyTypeEnum.EQUIRECTANGULAR as any:
        return renderTextureSettings((node as any).equirectangularPath, onChangeEquirectangularPathOption)
      case SkyTypeEnum.CUBEMAP as any:
        return renderTextureSettings((node as any).cubemapPath, onChangeCubemapPathOption)
      case SkyTypeEnum.COLOR as any:
        return renderColorSettings(node)
      default:
        return renderSkyboxSettings(node)
    }
  }

  // rendering editor view for SkyboxNode
  const skyboxComponent = getComponent(props.node.eid, SkyboxComponent)
  return (
    <NodeEditor description={SkyboxNodeEditor.description} {...props}>
      <InputGroup name="Sky Type" label={props.t('editor:properties.skybox.lbl-skyType')}>
        <SelectInput options={SkyOption} value={skyboxComponent.backgroundType} onChange={onChangeSkyOption} />
      </InputGroup>
      {renderSkyBoxProps(skyboxComponent)}
    </NodeEditor>
  )
}

SkyboxNodeEditor.iconComponent = Cloud
SkyboxNodeEditor.description = i18n.t('editor:properties.skybox.description')

export default withTranslation()(SkyboxNodeEditor)
