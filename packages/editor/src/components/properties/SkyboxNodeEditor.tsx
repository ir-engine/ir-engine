import React from 'react'
import { useTranslation } from 'react-i18next'
import { Color } from 'three'

import { useEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import {
  ComponentType,
  getComponent,
  hasComponent,
  useComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { ErrorComponent, getEntityErrors } from '@etherealengine/engine/src/scene/components/ErrorComponent'
import { SkyboxComponent } from '@etherealengine/engine/src/scene/components/SkyboxComponent'
import { SkyTypeEnum } from '@etherealengine/engine/src/scene/constants/SkyTypeEnum'

import CloudIcon from '@mui/icons-material/Cloud'

import ColorInput from '../inputs/ColorInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import FolderInput from '../inputs/FolderInput'
import ImageInput from '../inputs/ImageInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import RadianNumericInputGroup from '../inputs/RadianNumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperties, updateProperty } from './Util'

const hoursToRadians = (hours: number) => hours / 24
const radiansToHours = (rads: number) => rads * 24

/**
 * Types of skyboxes
 *
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
 * @type {class component}
 */
export const SkyboxNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.entity
  const hasError = getEntityErrors(entity, SkyboxComponent)
  const skyboxComponent = useComponent(entity, SkyboxComponent)

  const onChangeEquirectangularPathOption = (equirectangularPath) => {
    if (equirectangularPath !== skyboxComponent.equirectangularPath.value) {
      updateProperties(SkyboxComponent, { equirectangularPath })
    }
  }

  const onChangeCubemapPathOption = (path) => {
    const directory = path[path.length - 1] === '/' ? path.substring(0, path.length - 1) : path
    if (directory !== skyboxComponent.cubemapPath.value) {
      updateProperties(SkyboxComponent, { cubemapPath: directory })
    }
  }

  const renderSkyboxSettings = () => (
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
        value={skyboxComponent.skyboxProps.azimuth.value}
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
        value={skyboxComponent.skyboxProps.inclination.value}
        onChange={updateProperty(SkyboxComponent, 'skyboxProps.inclination' as any)}
      />
      <InputGroup name="Luminance" label={t('editor:properties.skybox.lbl-luminance')}>
        <CompoundNumericInput
          min={0.001}
          max={1.189}
          step={0.001}
          value={skyboxComponent.skyboxProps.luminance.value}
          onChange={updateProperty(SkyboxComponent, 'skyboxProps.luminance' as any)}
        />
      </InputGroup>
      <InputGroup name="Scattering Amount" label={t('editor:properties.skybox.lbl-scattering')}>
        <CompoundNumericInput
          min={0}
          max={0.1}
          step={0.001}
          value={skyboxComponent.skyboxProps.mieCoefficient.value}
          onChange={updateProperty(SkyboxComponent, 'skyboxProps.mieCoefficient' as any)}
        />
      </InputGroup>
      <InputGroup name="Scattering Distance" label={t('editor:properties.skybox.lbl-scatteringDistance')}>
        <CompoundNumericInput
          min={0}
          max={1}
          step={0.001}
          value={skyboxComponent.skyboxProps.mieDirectionalG.value}
          onChange={updateProperty(SkyboxComponent, 'skyboxProps.mieDirectionalG' as any)}
        />
      </InputGroup>
      <InputGroup name="Horizon Start" label={t('editor:properties.skybox.lbl-horizonStart')}>
        <CompoundNumericInput
          min={1}
          max={20}
          value={skyboxComponent.skyboxProps.turbidity.value}
          onChange={updateProperty(SkyboxComponent, 'skyboxProps.turbidity' as any)}
        />
      </InputGroup>
      <InputGroup name="Horizon End" label={t('editor:properties.skybox.lbl-horizonEnd')}>
        <CompoundNumericInput
          min={0}
          max={4}
          value={skyboxComponent.skyboxProps.rayleigh.value}
          onChange={updateProperty(SkyboxComponent, 'skyboxProps.rayleigh' as any)}
        />
      </InputGroup>
    </>
  )

  // creating editor view for equirectangular Settings
  const renderEquirectangularSettings = () => (
    <InputGroup name="Texture" label={t('editor:properties.skybox.lbl-texture')}>
      <ImageInput value={skyboxComponent.equirectangularPath.value} onChange={onChangeEquirectangularPathOption} />
      {hasError && <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.skybox.error-url')}</div>}
    </InputGroup>
  )

  // creating editor view for cubemap Settings
  const renderCubemapSettings = () => (
    <InputGroup name="Texture" label={t('editor:properties.skybox.lbl-texture')}>
      <FolderInput value={skyboxComponent.cubemapPath.value} onChange={onChangeCubemapPathOption} />
      {hasError && <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.skybox.error-url')}</div>}
    </InputGroup>
  )

  // creating editor view for color Settings
  const renderColorSettings = () => (
    <InputGroup name="Color" label={t('editor:properties.skybox.lbl-color')}>
      <ColorInput
        value={skyboxComponent.backgroundColor.value}
        onChange={updateProperty(SkyboxComponent, 'backgroundColor')}
      />
    </InputGroup>
  )

  // creating editor view for skybox Properties
  const renderSkyBoxProps = () => {
    switch (skyboxComponent.backgroundType.value) {
      case SkyTypeEnum.equirectangular:
        return renderEquirectangularSettings()
      case SkyTypeEnum.cubemap:
        return renderCubemapSettings()
      case SkyTypeEnum.color:
        return renderColorSettings()
      default:
        return renderSkyboxSettings()
    }
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.skybox.name')}
      description={t('editor:properties.skybox.description')}
    >
      <InputGroup name="Sky Type" label={t('editor:properties.skybox.lbl-skyType')}>
        <SelectInput
          key={props.entity}
          options={SkyOption}
          value={skyboxComponent.backgroundType.value}
          onChange={updateProperty(SkyboxComponent, 'backgroundType')}
        />
      </InputGroup>
      {renderSkyBoxProps()}
    </NodeEditor>
  )
}

SkyboxNodeEditor.iconComponent = CloudIcon

export default SkyboxNodeEditor
