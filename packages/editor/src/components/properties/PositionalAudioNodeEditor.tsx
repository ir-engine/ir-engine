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

import { useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { PositionalAudioComponent } from '@etherealengine/engine/src/audio/components/PositionalAudioComponent'
import { DistanceModel, DistanceModelOptions } from '@etherealengine/engine/src/audio/constants/AudioConstants'

import VolumeUpIcon from '@mui/icons-material/VolumeUp'

import CompoundNumericInput from '../inputs/CompoundNumericInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, commitProperty, updateProperty } from './Util'

/**
 * AudioNodeEditor used to customize audio element on the scene.
 *
 * @param       {Object} props
 * @constructor
 */
export const PositionalAudioNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const audioComponent = useComponent(props.entity, PositionalAudioComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.audio.name')}
      description={t('editor:properties.audio.description')}
    >
      <InputGroup
        name="Distance Model"
        label={t('editor:properties.audio.lbl-distanceModel')}
        info={t('editor:properties.audio.info-distanceModel')}
      >
        <SelectInput
          key={props.entity}
          options={DistanceModelOptions}
          value={audioComponent.distanceModel.value}
          onChange={commitProperty(PositionalAudioComponent, 'distanceModel')}
        />
      </InputGroup>

      {audioComponent.distanceModel.value === DistanceModel.Linear ? (
        <InputGroup
          name="Rolloff Factor"
          label={t('editor:properties.audio.lbl-rolloffFactor')}
          info={t('editor:properties.audio.info-rolloffFactor')}
        >
          <CompoundNumericInput
            min={0}
            max={1}
            smallStep={0.001}
            mediumStep={0.01}
            largeStep={0.1}
            value={audioComponent.rolloffFactor.value}
            onChange={updateProperty(PositionalAudioComponent, 'rolloffFactor')}
            onRelease={commitProperty(PositionalAudioComponent, 'rolloffFactor')}
          />
        </InputGroup>
      ) : (
        <NumericInputGroup
          name="Rolloff Factor"
          label={t('editor:properties.audio.lbl-rolloffFactor')}
          info={t('editor:properties.audio.info-rfInfinity')}
          min={0}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={audioComponent.rolloffFactor.value}
          onChange={updateProperty(PositionalAudioComponent, 'rolloffFactor')}
          onRelease={commitProperty(PositionalAudioComponent, 'rolloffFactor')}
        />
      )}
      <NumericInputGroup
        name="Ref Distance"
        label={t('editor:properties.audio.lbl-refDistance')}
        info={t('editor:properties.audio.info-refDistance')}
        min={0}
        smallStep={0.1}
        mediumStep={1}
        largeStep={10}
        value={audioComponent.refDistance.value}
        onChange={updateProperty(PositionalAudioComponent, 'refDistance')}
        onRelease={commitProperty(PositionalAudioComponent, 'refDistance')}
        unit="m"
      />
      <NumericInputGroup
        name="Max Distance"
        label={t('editor:properties.audio.lbl-maxDistance')}
        info={t('editor:properties.audio.info-maxDistance')}
        min={0.00001}
        smallStep={0.1}
        mediumStep={1}
        largeStep={10}
        value={audioComponent.maxDistance.value}
        onChange={updateProperty(PositionalAudioComponent, 'maxDistance')}
        onRelease={commitProperty(PositionalAudioComponent, 'maxDistance')}
        unit="m"
      />
      <NumericInputGroup
        name="Cone Inner Angle"
        label={t('editor:properties.audio.lbl-coneInnerAngle')}
        info={t('editor:properties.audio.info-coneInnerAngle')}
        min={0}
        max={360}
        smallStep={0.1}
        mediumStep={1}
        largeStep={10}
        value={audioComponent.coneInnerAngle.value}
        onChange={updateProperty(PositionalAudioComponent, 'coneInnerAngle')}
        onRelease={commitProperty(PositionalAudioComponent, 'coneInnerAngle')}
        unit="°"
      />
      <NumericInputGroup
        name="Cone Outer Angle"
        label={t('editor:properties.audio.lbl-coneOuterAngle')}
        info={t('editor:properties.audio.info-coneOuterAngle')}
        min={0}
        max={360}
        smallStep={0.1}
        mediumStep={1}
        largeStep={10}
        value={audioComponent.coneOuterAngle.value}
        onChange={updateProperty(PositionalAudioComponent, 'coneOuterAngle')}
        onRelease={commitProperty(PositionalAudioComponent, 'coneOuterAngle')}
        unit="°"
      />
      <InputGroup
        name="Cone Outer Gain"
        label={t('editor:properties.audio.lbl-coreOuterGain')}
        info={t('editor:properties.audio.info-coreOuterGain')}
      >
        <CompoundNumericInput
          min={0}
          max={1}
          step={0.01}
          value={audioComponent.coneOuterGain.value}
          onChange={updateProperty(PositionalAudioComponent, 'coneOuterGain')}
          onRelease={commitProperty(PositionalAudioComponent, 'coneOuterGain')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

//setting icon component name
PositionalAudioNodeEditor.iconComponent = VolumeUpIcon

export default PositionalAudioNodeEditor
