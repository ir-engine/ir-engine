/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { getEntityErrors } from '@etherealengine/engine/src/scene/components/ErrorComponent'
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
import { EditorComponentType, commitProperty, updateProperties, updateProperty } from './Util'

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
        onRelease={commitProperty(SkyboxComponent, 'skyboxProps.azimuth' as any)}
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
        onRelease={commitProperty(SkyboxComponent, 'skyboxProps.inclination' as any)}
      />
      <InputGroup name="Luminance" label={t('editor:properties.skybox.lbl-luminance')}>
        <CompoundNumericInput
          min={0.001}
          max={1.189}
          step={0.001}
          value={skyboxComponent.skyboxProps.luminance.value}
          onChange={updateProperty(SkyboxComponent, 'skyboxProps.luminance' as any)}
          onRelease={commitProperty(SkyboxComponent, 'skyboxProps.luminance' as any)}
        />
      </InputGroup>
      <InputGroup name="Scattering Amount" label={t('editor:properties.skybox.lbl-scattering')}>
        <CompoundNumericInput
          min={0}
          max={0.1}
          step={0.001}
          value={skyboxComponent.skyboxProps.mieCoefficient.value}
          onChange={updateProperty(SkyboxComponent, 'skyboxProps.mieCoefficient' as any)}
          onRelease={commitProperty(SkyboxComponent, 'skyboxProps.mieCoefficient' as any)}
        />
      </InputGroup>
      <InputGroup name="Scattering Distance" label={t('editor:properties.skybox.lbl-scatteringDistance')}>
        <CompoundNumericInput
          min={0}
          max={1}
          step={0.001}
          value={skyboxComponent.skyboxProps.mieDirectionalG.value}
          onChange={updateProperty(SkyboxComponent, 'skyboxProps.mieDirectionalG' as any)}
          onRelease={commitProperty(SkyboxComponent, 'skyboxProps.mieDirectionalG' as any)}
        />
      </InputGroup>
      <InputGroup name="Horizon Start" label={t('editor:properties.skybox.lbl-horizonStart')}>
        <CompoundNumericInput
          min={1}
          max={20}
          value={skyboxComponent.skyboxProps.turbidity.value}
          onChange={updateProperty(SkyboxComponent, 'skyboxProps.turbidity' as any)}
          onRelease={commitProperty(SkyboxComponent, 'skyboxProps.turbidity' as any)}
        />
      </InputGroup>
      <InputGroup name="Horizon End" label={t('editor:properties.skybox.lbl-horizonEnd')}>
        <CompoundNumericInput
          min={0}
          max={4}
          value={skyboxComponent.skyboxProps.rayleigh.value}
          onChange={updateProperty(SkyboxComponent, 'skyboxProps.rayleigh' as any)}
          onRelease={commitProperty(SkyboxComponent, 'skyboxProps.rayleigh' as any)}
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
        onRelease={commitProperty(SkyboxComponent, 'backgroundColor')}
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
          onChange={commitProperty(SkyboxComponent, 'backgroundType')}
        />
      </InputGroup>
      {renderSkyBoxProps()}
    </NodeEditor>
  )
}

SkyboxNodeEditor.iconComponent = CloudIcon

export default SkyboxNodeEditor
