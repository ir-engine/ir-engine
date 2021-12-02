import { Cloud } from '@styled-icons/fa-solid/Cloud'
import { SkyTypeEnum } from '@xrengine/engine/src/scene/constants/SkyTypeEnum'
import { getDirectoryFromUrl } from '@xrengine/common/src/utils/getDirectoryFromUrl'
import React from 'react'
import { useTranslation } from 'react-i18next'
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
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import {
  SkyboxComponent,
  SkyboxComponentType,
  SkyBoxShaderProps
} from '@xrengine/engine/src/scene/components/SkyboxComponent'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { Color } from 'three'

const hoursToRadians = (hours: number) => hours / 24
const radiansToHours = (rads: number) => rads * 24

/**
 * Types of skyboxes
 *
 * @author Robert Long
 * @type {Array}
 */
const SkyOption = [
  {
    label: 'Color',
    value: SkyTypeEnum.color
  },
  {
    label: 'Skybox',
    value: SkyTypeEnum.skybox
  },
  {
    label: 'Cubemap',
    value: SkyTypeEnum.cubemap
  },
  {
    label: 'Equirectangular',
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
  node: EntityTreeNode
}

/**
 * SkyboxNodeEditor component class used to render editor view to customize component property.
 *
 * @author Robert Long
 * @type {class component}
 */
export const SkyboxNodeEditor = (props: SkyboxNodeEditorProps) => {
  const { t } = useTranslation()

  //function to handle changes in turbidity Property
  const onChangeTurbidity = (turbidity) => {
    CommandManager.instance.setPropertyOnSelectionEntities(SkyboxComponent, 'skyboxProps.turbidity', turbidity)
  }

  //function to handle changes in rayleigh property
  const onChangeRayleigh = (rayleigh) => {
    CommandManager.instance.setPropertyOnSelectionEntities(SkyboxComponent, 'skyboxProps.rayleigh', rayleigh)
  }

  //function to handle the changes in luminance property
  const onChangeLuminance = (luminance) => {
    CommandManager.instance.setPropertyOnSelectionEntities(SkyboxComponent, 'skyboxProps.luminance', luminance)
  }

  //function to handle the changes in mieCoefficient property
  const onChangeMieCoefficient = (mieCoefficient) => {
    CommandManager.instance.setPropertyOnSelectionEntities(
      SkyboxComponent,
      'skyboxProps.mieCoefficient',
      mieCoefficient
    )
  }

  //function to handle the changes in mieDirectionalG property
  const onChangeMieDirectionalG = (mieDirectionalG) => {
    CommandManager.instance.setPropertyOnSelectionEntities(
      SkyboxComponent,
      'skyboxProps.mieDirectionalG',
      mieDirectionalG
    )
  }

  //function to handle the changes in inclination
  const onChangeInclination = (inclination) => {
    CommandManager.instance.setPropertyOnSelectionEntities(SkyboxComponent, 'skyboxProps.inclination', inclination)
  }

  //function to handle changes azimuth
  const onChangeAzimuth = (azimuth) => {
    CommandManager.instance.setPropertyOnSelectionEntities(SkyboxComponent, 'skyboxProps.azimuth', azimuth)
  }

  //function to handle changes in distance property
  // const onChangeDistance = (distance) => {
  //   CommandManager.instance.setPropertyOnSelectionEntities(SkyboxComponent, 'skyboxProps.distance', distance)
  // }

  //function to handle the changes skyType
  const onChangeSkyOption = (backgroundType) => {
    CommandManager.instance.setPropertyOnSelectionEntities(SkyboxComponent, 'backgroundType', backgroundType)
  }

  //function to handle the changes backgroundPath
  const onChangeEquirectangularPathOption = (path) => {
    if (path !== skyComponent.equirectangularPath) {
      CommandManager.instance.setPropertyOnSelectionEntities(SkyboxComponent, 'equirectangularPath', path)
    }
  }

  const onChangeCubemapPathOption = (path) => {
    const directory = getDirectoryFromUrl(path)

    if (directory !== skyComponent.cubemapPath) {
      CommandManager.instance.setPropertyOnSelectionEntities(SkyboxComponent, 'cubemapPath', directory)
    }
  }

  //function to handle the changes backgroundPath
  const onChangeColorOption = (backgroundColor) => {
    CommandManager.instance.setPropertyOnSelectionEntities(SkyboxComponent, 'backgroundColor', backgroundColor)
  }

  //creating editor view for skybox setting
  const renderSkyboxSettings = (skyboxProps: SkyBoxShaderProps) => (
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
        value={skyboxProps.azimuth}
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
        value={skyboxProps.inclination}
        onChange={onChangeInclination}
      />
      <InputGroup name="Luminance" label={t('editor:properties.skybox.lbl-luminance')}>
        <CompoundNumericInput
          min={0.001}
          max={1.189}
          step={0.001}
          value={skyboxProps.luminance}
          onChange={onChangeLuminance}
        />
      </InputGroup>
      <InputGroup name="Scattering Amount" label={t('editor:properties.skybox.lbl-scattering')}>
        <CompoundNumericInput
          min={0}
          max={0.1}
          step={0.001}
          value={skyboxProps.mieCoefficient}
          onChange={onChangeMieCoefficient}
        />
      </InputGroup>
      <InputGroup name="Scattering Distance" label={t('editor:properties.skybox.lbl-scatteringDistance')}>
        <CompoundNumericInput
          min={0}
          max={1}
          step={0.001}
          value={skyboxProps.mieDirectionalG}
          onChange={onChangeMieDirectionalG}
        />
      </InputGroup>
      <InputGroup name="Horizon Start" label={t('editor:properties.skybox.lbl-horizonStart')}>
        <CompoundNumericInput min={1} max={20} value={skyboxProps.turbidity} onChange={onChangeTurbidity} />
      </InputGroup>
      <InputGroup name="Horizon End" label={t('editor:properties.skybox.lbl-horizonEnd')}>
        <CompoundNumericInput min={0} max={4} value={skyboxProps.rayleigh} onChange={onChangeRayleigh} />
      </InputGroup>
    </>
  )

  // creating editor view for equirectangular Settings
  const renderEquirectangularSettings = (path: string) => (
    <InputGroup name="Texture" label={t('editor:properties.skybox.lbl-texture')}>
      <ImageInput value={path} onChange={onChangeEquirectangularPathOption} />
    </InputGroup>
  )

  // creating editor view for cubemap Settings
  const renderCubemapSettings = (path: string) => (
    <InputGroup name="Texture" label={t('editor:properties.skybox.lbl-texture')}>
      <FolderInput value={path} onChange={onChangeCubemapPathOption} />
    </InputGroup>
  )

  // creating editor view for color Settings
  const renderColorSettings = (bgColor: Color) => (
    <InputGroup name="Color" label={t('editor:properties.skybox.lbl-color')}>
      <ColorInput value={bgColor} onChange={onChangeColorOption} />
    </InputGroup>
  )

  // creating editor view for skybox Properties
  const renderSkyBoxProps = (skyComponent: SkyboxComponentType) => {
    switch (skyComponent.backgroundType) {
      case SkyTypeEnum.equirectangular:
        return renderEquirectangularSettings(skyComponent.equirectangularPath)
      case SkyTypeEnum.cubemap:
        return renderCubemapSettings(skyComponent.cubemapPath)
      case SkyTypeEnum.color:
        return renderColorSettings(skyComponent.backgroundColor)
      default:
        return renderSkyboxSettings(skyComponent.skyboxProps)
    }
  }

  // rendering editor view for SkyboxNode
  const skyComponent = getComponent(props.node.entity, SkyboxComponent)

  return (
    <NodeEditor description={t('editor:properties.skybox.description')} {...props}>
      <InputGroup name="Sky Type" label={t('editor:properties.skybox.lbl-skyType')}>
        <SelectInput options={SkyOption} value={skyComponent.backgroundType} onChange={onChangeSkyOption} />
      </InputGroup>
      {renderSkyBoxProps(skyComponent)}
    </NodeEditor>
  )
}

SkyboxNodeEditor.iconComponent = Cloud

export default SkyboxNodeEditor
