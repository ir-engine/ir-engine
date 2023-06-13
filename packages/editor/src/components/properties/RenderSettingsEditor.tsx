import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  ACESFilmicToneMapping,
  BasicShadowMap,
  CineonToneMapping,
  LinearToneMapping,
  NoToneMapping,
  PCFShadowMap,
  PCFSoftShadowMap,
  ReinhardToneMapping,
  ShadowMapType,
  ToneMapping,
  VSMShadowMap
} from 'three'

import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { RenderSettingsComponent } from '@etherealengine/engine/src/scene/components/RenderSettingsComponent'

import BooleanInput from '../inputs/BooleanInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import PropertyGroup from './PropertyGroup'
import { EditorComponentType } from './Util'

/**
 * ToneMappingOptions array containing tone mapping type options.
 *
 * @type {Array}
 */
const ToneMappingOptions = [
  {
    label: 'No Tone Mapping',
    value: NoToneMapping
  },
  {
    label: 'Linear Tone Mapping',
    value: LinearToneMapping
  },
  {
    label: 'Reinhard Tone Mapping',
    value: ReinhardToneMapping
  },
  {
    label: 'Cineon Tone Mapping',
    value: CineonToneMapping
  },
  {
    label: 'ACES Filmic Tone Mapping',
    value: ACESFilmicToneMapping
  }
]

/**
 * ShadowTypeOptions array containing shadow type options.
 *
 * @type {Array}
 */
const ShadowTypeOptions = [
  {
    label: 'No Shadow Map',
    value: -1
  },
  {
    label: 'Basic Shadow Map',
    value: BasicShadowMap
  },
  {
    label: 'PCF Shadow Map',
    value: PCFShadowMap
  },
  {
    label: 'PCF Soft Shadow Map',
    value: PCFSoftShadowMap
  },
  {
    label: 'VSM Shadow Map',
    value: VSMShadowMap
  }
]

export const RenderSettingsEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const rendererState = useComponent(props.entity, RenderSettingsComponent)

  return (
    <PropertyGroup
      name={t('editor:properties.renderSettings.name')}
      description={t('editor:properties.renderSettings.description')}
    >
      <InputGroup
        name="Use Cascading Shadow Maps"
        label={t('editor:properties.renderSettings.lbl-csm')}
        info={t('editor:properties.renderSettings.info-csm')}
      >
        <BooleanInput value={rendererState.csm.value} onChange={(val) => rendererState.csm.set(val)} />
      </InputGroup>
      <InputGroup
        name="Tone Mapping"
        label={t('editor:properties.renderSettings.lbl-toneMapping')}
        info={t('editor:properties.renderSettings.info-toneMapping')}
      >
        <SelectInput
          options={ToneMappingOptions}
          value={rendererState.toneMapping.value}
          onChange={(val: ToneMapping) => rendererState.toneMapping.set(val)}
        />
      </InputGroup>
      <InputGroup
        name="Tone Mapping Exposure"
        label={t('editor:properties.renderSettings.lbl-toneMappingExposure')}
        info={t('editor:properties.renderSettings.info-toneMappingExposure')}
      >
        <CompoundNumericInput
          min={0}
          max={10}
          step={0.1}
          value={rendererState.toneMappingExposure.value}
          onChange={(val) => rendererState.toneMappingExposure.set(val)}
        />
      </InputGroup>
      <InputGroup
        name="Shadow Map Type"
        label={t('editor:properties.renderSettings.lbl-shadowMapType')}
        info={t('editor:properties.renderSettings.info-shadowMapType')}
      >
        <SelectInput
          options={ShadowTypeOptions}
          value={rendererState.shadowMapType.value ?? -1}
          onChange={(val: ShadowMapType) => rendererState.shadowMapType.set(val)}
        />
      </InputGroup>
    </PropertyGroup>
  )
}
