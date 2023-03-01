import React from 'react'
import { useTranslation } from 'react-i18next'

import { DistanceModel, DistanceModelOptions } from '@etherealengine/engine/src/audio/constants/AudioConstants'
import { getMediaSceneMetadataState } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { getState, useHookstate } from '@etherealengine/hyperflux'

import BooleanInput from '../inputs/BooleanInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import PropertyGroup from './PropertyGroup'

export const MediaSettingsEditor = () => {
  const { t } = useTranslation()
  const mediaState = useHookstate(getMediaSceneMetadataState(Engine.instance.currentWorld))
  const media = mediaState.get({ noproxy: true })

  return (
    <PropertyGroup
      name={t('editor:properties.mediaSettings.name')}
      description={t('editor:properties.mediaSettings.description')}
    >
      <InputGroup
        name="Media Distance Model"
        label={t('editor:properties.mediaSettings.lbl-mediaDistanceModel')}
        info={t('editor:properties.mediaSettings.info-mediaDistanceModel')}
      >
        <SelectInput
          options={DistanceModelOptions}
          value={media.distanceModel}
          onChange={(val: DistanceModelType) => mediaState.distanceModel.set(val)}
        />
      </InputGroup>
      <InputGroup
        name="Use Immersive Media"
        label={t('editor:properties.mediaSettings.lbl-immersiveMedia')}
        info={t('editor:properties.mediaSettings.info-immersiveMedia')}
      >
        <BooleanInput value={media.immersiveMedia} onChange={(val) => mediaState.immersiveMedia.set(val)} />
      </InputGroup>

      {media.distanceModel === DistanceModel.Linear ? (
        <InputGroup
          name="Media Rolloff Factor"
          label={t('editor:properties.mediaSettings.lbl-mediaRolloffFactor')}
          info={t('editor:properties.mediaSettings.info-mediaRolloffFactor')}
        >
          <CompoundNumericInput
            min={0}
            max={1}
            smallStep={0.001}
            mediumStep={0.01}
            largeStep={0.1}
            value={media.rolloffFactor}
            onChange={(val) => mediaState.rolloffFactor.set(val)}
          />
        </InputGroup>
      ) : (
        <NumericInputGroup
          name="Media Rolloff Factor"
          label={t('editor:properties.mediaSettings.lbl-mediaRolloffFactor')}
          info={t('editor:properties.mediaSettings.info-mediaRolloffFactorInfinity')}
          min={0}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={media.rolloffFactor}
          onChange={(val) => mediaState.rolloffFactor.set(val)}
        />
      )}
      <NumericInputGroup
        name="Media Ref Distance"
        label={t('editor:properties.mediaSettings.lbl-mediaRefDistance')}
        info={t('editor:properties.mediaSettings.info-mediaRefDistance')}
        min={0}
        smallStep={0.1}
        mediumStep={1}
        largeStep={10}
        value={media.refDistance}
        onChange={(val) => mediaState.refDistance.set(val)}
        unit="m"
      />
      <NumericInputGroup
        name="Media Max Distance"
        label={t('editor:properties.mediaSettings.lbl-mediaMaxDistance')}
        info={t('editor:properties.mediaSettings.info-mediaMaxDistance')}
        min={0}
        smallStep={0.1}
        mediumStep={1}
        largeStep={10}
        value={media.maxDistance}
        onChange={(val) => mediaState.maxDistance.set(val)}
        unit="m"
      />
      <NumericInputGroup
        name="Media Cone Inner Angle"
        label={t('editor:properties.mediaSettings.lbl-mediaConeInnerAngle')}
        info={t('editor:properties.mediaSettings.info-mediaConeInnerAngle')}
        min={0}
        max={360}
        smallStep={0.1}
        mediumStep={1}
        largeStep={10}
        value={media.coneInnerAngle}
        onChange={(val) => mediaState.coneInnerAngle.set(val)}
        unit="°"
      />
      <NumericInputGroup
        name="Media Cone Outer Angle"
        label={t('editor:properties.mediaSettings.lbl-mediaConeOuterAngle')}
        info={t('editor:properties.mediaSettings.info-mediaConeOuterAngle')}
        min={0}
        max={360}
        smallStep={0.1}
        mediumStep={1}
        largeStep={10}
        value={media.coneOuterAngle}
        onChange={(val) => mediaState.coneOuterAngle.set(val)}
        unit="°"
      />
      <InputGroup
        name="Media Cone Outer Gain"
        label={t('editor:properties.mediaSettings.lbl-mediaConeOuterGain')}
        info={t('editor:properties.mediaSettings.info-mediaConeOuterGain')}
      >
        <CompoundNumericInput
          min={0}
          max={1}
          step={0.01}
          value={media.coneOuterGain}
          onChange={(val) => mediaState.coneOuterGain.set(val)}
        />
      </InputGroup>
    </PropertyGroup>
  )
}
