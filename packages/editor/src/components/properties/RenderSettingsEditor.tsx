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
  VSMShadowMap
} from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getState, useHookstate } from '@xrengine/hyperflux'

import BooleanInput from '../inputs/BooleanInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import Vector3Input from '../inputs/Vector3Input'
import PropertyGroup from './PropertyGroup'

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

export const RenderSettingsEditor = () => {
  const { t } = useTranslation()
  const sceneMetadata = useHookstate(Engine.instance.currentWorld.sceneMetadata.renderSettings)
  const settings = sceneMetadata.get({ noproxy: true })

  return (
    <PropertyGroup
      name={t('editor:properties.renderSettings.name')}
      description={t('editor:properties.renderSettings.description')}
    >
      <InputGroup
        name="LODs"
        label={t('editor:properties.renderSettings.lbl-lods')}
        info={t('editor:properties.renderSettings.info-lods')}
      >
        <Vector3Input
          hideLabels
          value={settings.LODs}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={(val) => sceneMetadata.LODs.set(val)}
        />
      </InputGroup>
      <InputGroup
        name="Use Cascading Shadow Maps"
        label={t('editor:properties.renderSettings.lbl-csm')}
        info={t('editor:properties.renderSettings.info-csm')}
      >
        <BooleanInput value={settings.csm} onChange={(val) => sceneMetadata.csm.set(val)} />
      </InputGroup>
      <InputGroup
        name="Tone Mapping"
        label={t('editor:properties.renderSettings.lbl-toneMapping')}
        info={t('editor:properties.renderSettings.info-toneMapping')}
      >
        <SelectInput
          options={ToneMappingOptions}
          value={settings.toneMapping}
          onChange={(val) => sceneMetadata.toneMapping.set(val)}
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
          value={settings.toneMappingExposure}
          onChange={(val) => sceneMetadata.toneMappingExposure.set(val)}
        />
      </InputGroup>
      <InputGroup
        name="Shadow Map Type"
        label={t('editor:properties.renderSettings.lbl-shadowMapType')}
        info={t('editor:properties.renderSettings.info-shadowMapType')}
      >
        <SelectInput
          options={ShadowTypeOptions}
          value={settings.shadowMapType ?? -1}
          onChange={(val) => sceneMetadata.shadowMapType.set(val)}
        />
      </InputGroup>
    </PropertyGroup>
  )
}
