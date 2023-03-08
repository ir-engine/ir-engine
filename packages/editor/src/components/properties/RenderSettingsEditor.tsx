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
  Vector3,
  VSMShadowMap
} from 'three'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { getRendererSceneMetadataState } from '@etherealengine/engine/src/renderer/WebGLRendererSystem'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

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
  const rendererState = useHookstate(getRendererSceneMetadataState(Engine.instance.currentScene))
  const renderer = rendererState.get({ noproxy: true })

  return (
    <PropertyGroup
      name={t('editor:properties.renderSettings.name')}
      description={t('editor:properties.renderSettings.description')}
    >
      {/* <InputGroup
        name="LODs"
        label={t('editor:properties.renderSettings.lbl-lods')}
        info={t('editor:properties.renderSettings.info-lods')}
      >
        <Vector3Input
          hideLabels
          value={new Vector3(renderer.LODs['0'], renderer.LODs['1'], renderer.LODs['2'])}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={(val) => rendererState.LODs.set({ '0': val.x, '1': val.y, '2': val.z })}
        />
      </InputGroup> */}
      <InputGroup
        name="Use Cascading Shadow Maps"
        label={t('editor:properties.renderSettings.lbl-csm')}
        info={t('editor:properties.renderSettings.info-csm')}
      >
        <BooleanInput value={renderer.csm} onChange={(val) => rendererState.csm.set(val)} />
      </InputGroup>
      <InputGroup
        name="Tone Mapping"
        label={t('editor:properties.renderSettings.lbl-toneMapping')}
        info={t('editor:properties.renderSettings.info-toneMapping')}
      >
        <SelectInput
          options={ToneMappingOptions}
          value={renderer.toneMapping}
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
          value={renderer.toneMappingExposure}
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
          value={renderer.shadowMapType ?? -1}
          onChange={(val: ShadowMapType) => rendererState.shadowMapType.set(val)}
        />
      </InputGroup>
    </PropertyGroup>
  )
}
