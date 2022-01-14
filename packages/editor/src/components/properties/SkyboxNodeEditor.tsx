import { SkyTypeEnum } from '@xrengine/engine/src/scene/constants/SkyTypeEnum'
import CloudIcon from '@mui/icons-material/Cloud'
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
import { Color } from 'three'
import { EditorComponentType, updateProperty } from './Util'

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
 * SkyboxNodeEditor component class used to render editor view to customize component property.
 *
 * @author Robert Long
 * @type {class component}
 */
export const SkyboxNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const onChangeEquirectangularPathOption = (equirectangularPath) => {
    if (equirectangularPath !== skyComponent.equirectangularPath) {
      CommandManager.instance.setPropertyOnSelectionEntities({
        component: SkyboxComponent,
        properties: { equirectangularPath }
      })
    }
  }

  const onChangeCubemapPathOption = (path) => {
    const directory = getDirectoryFromUrl(path)

    if (directory !== skyComponent.cubemapPath) {
      CommandManager.instance.setPropertyOnSelectionEntities({
        component: SkyboxComponent,
        properties: { cubemapPath: directory }
      })
    }
  }

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
        onChange={updateProperty(SkyboxComponent, 'skyboxProps.azimuth' as any)}
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
        onChange={updateProperty(SkyboxComponent, 'skyboxProps.inclination' as any)}
      />
      <InputGroup name="Luminance" label={t('editor:properties.skybox.lbl-luminance')}>
        <CompoundNumericInput
          min={0.001}
          max={1.189}
          step={0.001}
          value={skyboxProps.luminance}
          onChange={updateProperty(SkyboxComponent, 'skyboxProps.luminance' as any)}
        />
      </InputGroup>
      <InputGroup name="Scattering Amount" label={t('editor:properties.skybox.lbl-scattering')}>
        <CompoundNumericInput
          min={0}
          max={0.1}
          step={0.001}
          value={skyboxProps.mieCoefficient}
          onChange={updateProperty(SkyboxComponent, 'skyboxProps.mieCoefficient' as any)}
        />
      </InputGroup>
      <InputGroup name="Scattering Distance" label={t('editor:properties.skybox.lbl-scatteringDistance')}>
        <CompoundNumericInput
          min={0}
          max={1}
          step={0.001}
          value={skyboxProps.mieDirectionalG}
          onChange={updateProperty(SkyboxComponent, 'skyboxProps.mieDirectionalG' as any)}
        />
      </InputGroup>
      <InputGroup name="Horizon Start" label={t('editor:properties.skybox.lbl-horizonStart')}>
        <CompoundNumericInput
          min={1}
          max={20}
          value={skyboxProps.turbidity}
          onChange={updateProperty(SkyboxComponent, 'skyboxProps.turbidity' as any)}
        />
      </InputGroup>
      <InputGroup name="Horizon End" label={t('editor:properties.skybox.lbl-horizonEnd')}>
        <CompoundNumericInput
          min={0}
          max={4}
          value={skyboxProps.rayleigh}
          onChange={updateProperty(SkyboxComponent, 'skyboxProps.rayleigh' as any)}
        />
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
      <ColorInput value={bgColor} onChange={updateProperty(SkyboxComponent, 'backgroundColor')} />
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

  const skyComponent = getComponent(props.node.entity, SkyboxComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.skybox.name')}
      description={t('editor:properties.skybox.description')}
    >
      <InputGroup name="Sky Type" label={t('editor:properties.skybox.lbl-skyType')}>
        <SelectInput
          options={SkyOption}
          value={skyComponent.backgroundType}
          onChange={updateProperty(SkyboxComponent, 'backgroundType')}
        />
      </InputGroup>
      {renderSkyBoxProps(skyComponent)}
    </NodeEditor>
  )
}

SkyboxNodeEditor.iconComponent = CloudIcon

export default SkyboxNodeEditor
