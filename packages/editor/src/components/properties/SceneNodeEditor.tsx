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

import { DistanceModel, DistanceModelOptions } from '@xrengine/engine/src/audio/constants/AudioConstants'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { PositionalAudioSettingsComponent } from '@xrengine/engine/src/scene/components/AudioSettingsComponent'
import { MetaDataComponent } from '@xrengine/engine/src/scene/components/MetaDataComponent'
import { RenderSettingComponent } from '@xrengine/engine/src/scene/components/RenderSettingComponent'

import LanguageIcon from '@mui/icons-material/Language'

import BooleanInput from '../inputs/BooleanInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
import Vector3Input from '../inputs/Vector3Input'
import EnvMapEditor from './EnvMapEditor'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

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

/**
 * SceneNodeEditor provides the editor view for property customization.
 *
 * @param       props
 * @constructor
 */
export const SceneNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.node.entity

  const metadata = getComponent(entity, MetaDataComponent)
  const audioComponent = getComponent(entity, PositionalAudioSettingsComponent)
  const renderSettingComponent = getComponent(entity, RenderSettingComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.scene.name')}
      description={t('editor:properties.scene.description')}
    >
      <InputGroup name="Metadata" label="Metadata">
        <StringInput value={metadata.meta_data} onChange={updateProperty(MetaDataComponent, 'meta_data')} />
      </InputGroup>
      <EnvMapEditor node={props.node} />
      <InputGroup
        name="Media Distance Model"
        label={t('editor:properties.scene.lbl-mediaDistanceModel')}
        info={t('editor:properties.scene.info-mediaDistanceModel')}
      >
        <SelectInput
          key={props.node.entity}
          options={DistanceModelOptions}
          value={audioComponent.distanceModel}
          onChange={updateProperty(PositionalAudioSettingsComponent, 'distanceModel')}
        />
      </InputGroup>

      {audioComponent.distanceModel === DistanceModel.Linear ? (
        <InputGroup
          name="Media Rolloff Factor"
          label={t('editor:properties.scene.lbl-mediaRolloffFactor')}
          info={t('editor:properties.scene.info-mediaRolloffFactor')}
        >
          <CompoundNumericInput
            min={0}
            max={1}
            smallStep={0.001}
            mediumStep={0.01}
            largeStep={0.1}
            value={audioComponent.rolloffFactor}
            onChange={updateProperty(PositionalAudioSettingsComponent, 'rolloffFactor')}
          />
        </InputGroup>
      ) : (
        <NumericInputGroup
          name="Media Rolloff Factor"
          label={t('editor:properties.scene.lbl-mediaRolloffFactor')}
          info={t('editor:properties.scene.info-mediaRolloffFactorInfinity')}
          min={0}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={audioComponent.rolloffFactor}
          onChange={updateProperty(PositionalAudioSettingsComponent, 'rolloffFactor')}
        />
      )}
      <NumericInputGroup
        name="Media Ref Distance"
        label={t('editor:properties.scene.lbl-mediaRefDistance')}
        info={t('editor:properties.scene.info-mediaRefDistance')}
        min={0}
        smallStep={0.1}
        mediumStep={1}
        largeStep={10}
        value={audioComponent.refDistance}
        onChange={updateProperty(PositionalAudioSettingsComponent, 'refDistance')}
        unit="m"
      />
      <NumericInputGroup
        name="Media Max Distance"
        label={t('editor:properties.scene.lbl-mediaMaxDistance')}
        info={t('editor:properties.scene.info-mediaMaxDistance')}
        min={0}
        smallStep={0.1}
        mediumStep={1}
        largeStep={10}
        value={audioComponent.maxDistance}
        onChange={updateProperty(PositionalAudioSettingsComponent, 'maxDistance')}
        unit="m"
      />
      <NumericInputGroup
        name="Media Cone Inner Angle"
        label={t('editor:properties.scene.lbl-mediaConeInnerAngle')}
        info={t('editor:properties.scene.info-mediaConeInnerAngle')}
        min={0}
        max={360}
        smallStep={0.1}
        mediumStep={1}
        largeStep={10}
        value={audioComponent.coneInnerAngle}
        onChange={updateProperty(PositionalAudioSettingsComponent, 'coneInnerAngle')}
        unit="°"
      />
      <NumericInputGroup
        name="Media Cone Outer Angle"
        label={t('editor:properties.scene.lbl-mediaConeOuterAngle')}
        info={t('editor:properties.scene.info-mediaConeOuterAngle')}
        min={0}
        max={360}
        smallStep={0.1}
        mediumStep={1}
        largeStep={10}
        value={audioComponent.coneOuterAngle}
        onChange={updateProperty(PositionalAudioSettingsComponent, 'coneOuterAngle')}
        unit="°"
      />
      <InputGroup
        name="Media Cone Outer Gain"
        label={t('editor:properties.scene.lbl-mediaConeOuterGain')}
        info={t('editor:properties.scene.info-mediaConeOuterGain')}
      >
        <CompoundNumericInput
          min={0}
          max={1}
          step={0.01}
          value={audioComponent.coneOuterGain}
          onChange={updateProperty(PositionalAudioSettingsComponent, 'coneOuterGain')}
        />
      </InputGroup>
      <InputGroup
        name="LODs"
        label={t('editor:properties.scene.lbl-lods')}
        info={t('editor:properties.scene.info-lods')}
      >
        <Vector3Input
          hideLabels
          value={renderSettingComponent.LODs}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={updateProperty(RenderSettingComponent, 'LODs')}
        />
      </InputGroup>
      <InputGroup name="Override Renderer Settings" label={t('editor:properties.scene.lbl-rendererSettings')}>
        <BooleanInput
          value={renderSettingComponent.overrideRendererSettings}
          onChange={updateProperty(RenderSettingComponent, 'overrideRendererSettings')}
        />
      </InputGroup>
      {renderSettingComponent.overrideRendererSettings && (
        <>
          <InputGroup
            name="Use Cascading Shadow Maps"
            label={t('editor:properties.scene.lbl-csm')}
            info={t('editor:properties.scene.info-csm')}
          >
            <BooleanInput value={renderSettingComponent.csm} onChange={updateProperty(RenderSettingComponent, 'csm')} />
          </InputGroup>
          <InputGroup
            name="Tone Mapping"
            label={t('editor:properties.scene.lbl-toneMapping')}
            info={t('editor:properties.scene.info-toneMapping')}
          >
            <SelectInput
              key={props.node.entity}
              options={ToneMappingOptions}
              value={renderSettingComponent.toneMapping}
              onChange={updateProperty(RenderSettingComponent, 'toneMapping')}
            />
          </InputGroup>
          <InputGroup
            name="Tone Mapping Exposure"
            label={t('editor:properties.scene.lbl-toneMappingExposure')}
            info={t('editor:properties.scene.info-toneMappingExposure')}
          >
            <CompoundNumericInput
              min={0}
              max={10}
              step={0.1}
              value={renderSettingComponent.toneMappingExposure}
              onChange={updateProperty(RenderSettingComponent, 'toneMappingExposure')}
            />
          </InputGroup>
          <InputGroup
            name="Shadow Map Type"
            label={t('editor:properties.scene.lbl-shadowMapType')}
            info={t('editor:properties.scene.info-shadowMapType')}
          >
            <SelectInput
              key={props.node.entity}
              options={ShadowTypeOptions}
              value={renderSettingComponent.shadowMapType ?? -1}
              onChange={updateProperty(RenderSettingComponent, 'shadowMapType')}
            />
          </InputGroup>
        </>
      )}
    </NodeEditor>
  )
}

// setting icon component with icon name
SceneNodeEditor.iconComponent = LanguageIcon

export default SceneNodeEditor
