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

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { PiSpeakerLowLight } from 'react-icons/pi'

import { hasComponent, useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import {
  EditorComponentType,
  commitProperty,
  updateProperty
} from '@etherealengine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@etherealengine/editor/src/functions/EditorControlFunctions'
import { SelectionState } from '@etherealengine/editor/src/services/SelectionServices'
import { PositionalAudioComponent } from '@etherealengine/engine/src/audio/components/PositionalAudioComponent'
import { DistanceModel, DistanceModelOptions } from '@etherealengine/engine/src/audio/constants/AudioConstants'
import { MediaComponent } from '@etherealengine/engine/src/scene/components/MediaComponent'
import { VolumetricComponent } from '@etherealengine/engine/src/scene/components/VolumetricComponent'
import Slider from '../../../../primitives/tailwind/Slider'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'
import NodeEditor from '../nodeEditor'

/**
 * AudioNodeEditor used to customize audio element on the scene.
 */
export const PositionalAudioNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const audioComponent = useComponent(props.entity, PositionalAudioComponent)

  useEffect(() => {
    if (!hasComponent(props.entity, MediaComponent) && !hasComponent(props.entity, VolumetricComponent)) {
      const nodes = SelectionState.getSelectedEntities()
      EditorControlFunctions.addOrRemoveComponent(nodes, MediaComponent, true)
    }
  }, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.audio.name')}
      description={t('editor:properties.audio.description')}
      icon={<PiSpeakerLowLight />}
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
          <NumericInput
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
        <InputGroup
          name="Rolloff Factor"
          label={t('editor:properties.audio.lbl-rolloffFactor')}
          info={t('editor:properties.audio.info-rfInfinity')}
        >
          <NumericInput
            min={0}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={audioComponent.rolloffFactor.value}
            onChange={updateProperty(PositionalAudioComponent, 'rolloffFactor')}
            onRelease={commitProperty(PositionalAudioComponent, 'rolloffFactor')}
          />
        </InputGroup>
      )}
      <InputGroup
        name="Ref Distance"
        label={t('editor:properties.audio.lbl-refDistance')}
        info={t('editor:properties.audio.info-refDistance')}
      >
        <NumericInput
          min={0}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={audioComponent.refDistance.value}
          onChange={updateProperty(PositionalAudioComponent, 'refDistance')}
          onRelease={commitProperty(PositionalAudioComponent, 'refDistance')}
          unit="m"
        />
      </InputGroup>
      <InputGroup
        name="Max Distance"
        label={t('editor:properties.audio.lbl-maxDistance')}
        info={t('editor:properties.audio.info-maxDistance')}
      >
        <NumericInput
          min={0.00001}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={audioComponent.maxDistance.value}
          onChange={updateProperty(PositionalAudioComponent, 'maxDistance')}
          onRelease={commitProperty(PositionalAudioComponent, 'maxDistance')}
          unit="m"
        />
      </InputGroup>
      <InputGroup
        name="Cone Inner Angle"
        label={t('editor:properties.audio.lbl-coneInnerAngle')}
        info={t('editor:properties.audio.info-coneInnerAngle')}
      >
        <NumericInput
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
      </InputGroup>
      <InputGroup
        name="Cone Outer Angle"
        label={t('editor:properties.audio.lbl-coneOuterAngle')}
        info={t('editor:properties.audio.info-coneOuterAngle')}
      >
        <NumericInput
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
      </InputGroup>
      <InputGroup
        name="Cone Outer Gain"
        label={t('editor:properties.audio.lbl-coreOuterGain')}
        info={t('editor:properties.audio.info-coreOuterGain')}
      >
        <Slider
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

PositionalAudioNodeEditor.iconComponent = PiSpeakerLowLight

export default PositionalAudioNodeEditor
