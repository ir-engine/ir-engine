import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getDirectoryFromUrl } from '@xrengine/common/src/utils/getDirectoryFromUrl'
import { SkyTypeEnum } from '@xrengine/engine/src/scene/constants/SkyBoxShaderProps'

import CloudIcon from '@mui/icons-material/Cloud'

import { CommandManager } from '../../managers/CommandManager'
import ColorInput from '../inputs/ColorInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import FolderInput from '../inputs/FolderInput'
import ImageInput from '../inputs/ImageInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import RadianNumericInputGroup from '../inputs/RadianNumericInputGroup'
import SelectInput from '../inputs/SelectInput'
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
}

/**
 * SkyboxNodeEditor component class used to render editor view to customize component property.
 *
 * @author Robert Long
 * @type {class component}
 */
export const SkyboxNodeEditor = (props: SkyboxNodeEditorProps) => {
  const [, updateState] = useState()
  const { t } = useTranslation()

  const forceUpdate = useCallback(() => updateState({}), [])

  //function to handle changes in turbidity Property
  const onChangeTurbidity = (turbidity) => {
    CommandManager.instance.setPropertyOnSelection('turbidity', turbidity)
    forceUpdate()
  }

  //function to handle changes in rayleigh property
  const onChangeRayleigh = (rayleigh) => {
    CommandManager.instance.setPropertyOnSelection('rayleigh', rayleigh)
    forceUpdate()
  }

  //function to handle the changes in luminance property
  const onChangeLuminance = (luminance) => {
    CommandManager.instance.setPropertyOnSelection('luminance', luminance)
    forceUpdate()
  }

  //function to handle the changes in mieCoefficient property
  const onChangeMieCoefficient = (mieCoefficient) => {
    CommandManager.instance.setPropertyOnSelection('mieCoefficient', mieCoefficient)
    forceUpdate()
  }

  //function to handle the changes in mieDirectionalG property
  const onChangeMieDirectionalG = (mieDirectionalG) => {
    CommandManager.instance.setPropertyOnSelection('mieDirectionalG', mieDirectionalG)
    forceUpdate()
  }

  //function to handle the changes in inclination
  const onChangeInclination = (inclination) => {
    CommandManager.instance.setPropertyOnSelection('inclination', inclination)
    forceUpdate()
  }

  //function to handle changes azimuth
  const onChangeAzimuth = (azimuth) => {
    CommandManager.instance.setPropertyOnSelection('azimuth', azimuth)
    forceUpdate()
  }

  //function to handle changes in distance property
  const onChangeDistance = (distance) => {
    CommandManager.instance.setPropertyOnSelection('distance', distance)
  }

  //function to handle the changes skyType
  const onChangeSkyOption = (backgroundType) => {
    CommandManager.instance.setPropertyOnSelection('backgroundType', backgroundType)
    forceUpdate()
  }

  //function to handle the changes backgroundPath
  const onChangeEquirectangularPathOption = (path) => {
    CommandManager.instance.setPropertyOnSelection('equirectangularPath', path)
    forceUpdate()
  }

  const onChangeCubemapPathOption = (path) => {
    const directory = getDirectoryFromUrl(path)
    if (directory !== (node as any).cubemapPath) {
      CommandManager.instance.setPropertyOnSelection('cubemapPath', directory)
      forceUpdate()
    }
  }

  //function to handle the changes backgroundPath
  const onChangeColorOption = (backgroundColor) => {
    CommandManager.instance.setPropertyOnSelection('backgroundColor', backgroundColor)
    forceUpdate()
  }

  //creating editor view for skybox setting
  const renderSkyboxSettings = (node) => (
    <>
      <NumericInputGroup
        name="Time of Day"
        label={t('editor:properties.skybox.lbl-timeOfDay')}
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
        label={t('editor:properties.skybox.lbl-latitude')}
        min={-90}
        max={90}
        smallStep={0.1}
        mediumStep={0.5}
        largeStep={1}
        value={node.inclination}
        onChange={onChangeInclination}
      />
      <InputGroup name="Luminance" label={t('editor:properties.skybox.lbl-luminance')}>
        <CompoundNumericInput
          min={0.001}
          max={1.189}
          step={0.001}
          value={node.luminance}
          onChange={onChangeLuminance}
        />
      </InputGroup>
      <InputGroup name="Scattering Amount" label={t('editor:properties.skybox.lbl-scattering')}>
        <CompoundNumericInput
          min={0}
          max={0.1}
          step={0.001}
          value={node.mieCoefficient}
          onChange={onChangeMieCoefficient}
        />
      </InputGroup>
      <InputGroup name="Scattering Distance" label={t('editor:properties.skybox.lbl-scatteringDistance')}>
        <CompoundNumericInput
          min={0}
          max={1}
          step={0.001}
          value={node.mieDirectionalG}
          onChange={onChangeMieDirectionalG}
        />
      </InputGroup>
      <InputGroup name="Horizon Start" label={t('editor:properties.skybox.lbl-horizonStart')}>
        <CompoundNumericInput min={1} max={20} value={node.turbidity} onChange={onChangeTurbidity} />
      </InputGroup>
      <InputGroup name="Horizon End" label={t('editor:properties.skybox.lbl-horizonEnd')}>
        <CompoundNumericInput min={0} max={4} value={node.rayleigh} onChange={onChangeRayleigh} />
      </InputGroup>
    </>
  )

  // creating editor view for equirectangular Settings
  const renderEquirectangularSettings = (value, onChange) => (
    <>
      <InputGroup name="Texture" label={t('editor:properties.skybox.lbl-texture')}>
        <ImageInput value={value} onChange={onChange} />
      </InputGroup>
    </>
  )

  // creating editor view for cubemap Settings
  const renderCubemapSettings = (value, onChange) => (
    <>
      <InputGroup name="Texture" label={t('editor:properties.skybox.lbl-texture')}>
        <FolderInput value={value} onChange={onChange} />
      </InputGroup>
    </>
  )

  // creating editor view for color Settings
  const renderColorSettings = (node) => (
    <>
      <InputGroup name="Color" label={t('editor:properties.skybox.lbl-color')}>
        <ColorInput value={node.backgroundColor} onChange={onChangeColorOption} isValueAsInteger={true} />
      </InputGroup>
    </>
  )

  // creating editor view for skybox Properties
  const renderSkyBoxProps = (node) => {
    switch (node.backgroundType) {
      case SkyTypeEnum.equirectangular as any:
        return renderEquirectangularSettings((node as any).equirectangularPath, onChangeEquirectangularPathOption)
      case SkyTypeEnum.cubemap as any:
        return renderCubemapSettings((node as any).cubemapPath, onChangeCubemapPathOption)
      case SkyTypeEnum.color as any:
        return renderColorSettings(node)
      default:
        return renderSkyboxSettings(node)
    }
  }

  // rendering editor view for SkyboxNode
  const node = props.node
  return (
    <NodeEditor description={t('editor:properties.skybox.description')} {...props}>
      <InputGroup name="Sky Type" label={t('editor:properties.skybox.lbl-skyType')}>
        <SelectInput options={SkyOption} value={node.backgroundType} onChange={onChangeSkyOption} />
      </InputGroup>
      {renderSkyBoxProps(node)}
    </NodeEditor>
  )
}

SkyboxNodeEditor.iconComponent = CloudIcon

export default SkyboxNodeEditor
