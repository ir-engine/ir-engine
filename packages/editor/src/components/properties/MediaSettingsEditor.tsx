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

import { DistanceModel, DistanceModelOptions } from '@etherealengine/engine/src/audio/constants/AudioConstants'
import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { MediaSettingsComponent } from '@etherealengine/engine/src/scene/components/MediaSettingsComponent'

import BooleanInput from '../inputs/BooleanInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import PropertyGroup from './PropertyGroup'
import { EditorComponentType, commitProperty, updateProperty } from './Util'

export const MediaSettingsEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const mediaState = useComponent(props.entity, MediaSettingsComponent)

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
          value={mediaState.distanceModel.value}
          onChange={commitProperty(MediaSettingsComponent, 'distanceModel')}
        />
      </InputGroup>
      <InputGroup
        name="Use Immersive Media"
        label={t('editor:properties.mediaSettings.lbl-immersiveMedia')}
        info={t('editor:properties.mediaSettings.info-immersiveMedia')}
      >
        <BooleanInput
          value={mediaState.immersiveMedia.value}
          onChange={commitProperty(MediaSettingsComponent, 'immersiveMedia')}
        />
      </InputGroup>

      {mediaState.distanceModel.value === DistanceModel.Linear ? (
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
            value={mediaState.rolloffFactor.value}
            onChange={updateProperty(MediaSettingsComponent, 'rolloffFactor')}
            onRelease={commitProperty(MediaSettingsComponent, 'rolloffFactor')}
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
          value={mediaState.rolloffFactor.value}
          onChange={updateProperty(MediaSettingsComponent, 'rolloffFactor')}
          onRelease={commitProperty(MediaSettingsComponent, 'rolloffFactor')}
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
        value={mediaState.refDistance.value}
        onChange={updateProperty(MediaSettingsComponent, 'refDistance')}
        onRelease={commitProperty(MediaSettingsComponent, 'refDistance')}
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
        value={mediaState.maxDistance.value}
        onChange={updateProperty(MediaSettingsComponent, 'maxDistance')}
        onRelease={commitProperty(MediaSettingsComponent, 'maxDistance')}
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
        value={mediaState.coneInnerAngle.value}
        onChange={updateProperty(MediaSettingsComponent, 'coneInnerAngle')}
        onRelease={commitProperty(MediaSettingsComponent, 'coneInnerAngle')}
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
        value={mediaState.coneOuterAngle.value}
        onChange={updateProperty(MediaSettingsComponent, 'coneOuterAngle')}
        onRelease={commitProperty(MediaSettingsComponent, 'coneOuterAngle')}
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
          value={mediaState.coneOuterGain.value}
          onChange={updateProperty(MediaSettingsComponent, 'coneOuterGain')}
          onRelease={commitProperty(MediaSettingsComponent, 'coneOuterGain')}
        />
      </InputGroup>
    </PropertyGroup>
  )
}
