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

import { useComponent } from '@etherealengine/ecs'
import {
  EditorComponentType,
  commitProperty,
  updateProperty
} from '@etherealengine/editor/src/components/properties/Util'
import { AudioAnalysisComponent } from '@etherealengine/engine/src/scene/components/AudioAnalysisComponent'
import { SiAudiomack } from 'react-icons/si'
import Slider from '../../../../../primitives/tailwind/Slider'
import BooleanInput from '../../../input/Boolean'
import InputGroup from '../../../input/Group'
import NodeEditor from '../../nodeEditor'

export const AudioAnalysisEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const audioAnalysisComponent = useComponent(props.entity, AudioAnalysisComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.audioAnalysis.name')}
      icon={<AudioAnalysisEditor.iconComponent />}
    >
      <InputGroup name="Bass" label={t('editor:properties.audioAnalysis.lbl-bassEnabled')}>
        <BooleanInput
          value={audioAnalysisComponent.bassEnabled.value}
          onChange={commitProperty(AudioAnalysisComponent, 'bassEnabled')}
        />
      </InputGroup>
      <InputGroup
        name="Bass Multiplier"
        label={t('editor:properties.audioAnalysis.lbl-bassMultiplier')}
        childrenClassName="w-auto"
      >
        <Slider
          min={0}
          max={5}
          step={0.01}
          value={audioAnalysisComponent.bassMultiplier.value}
          onChange={updateProperty(AudioAnalysisComponent, 'bassMultiplier')}
          onRelease={commitProperty(AudioAnalysisComponent, 'bassMultiplier')}
        />
      </InputGroup>
      <InputGroup name="Mid Enabled" label={t('editor:properties.audioAnalysis.lbl-midEnabled')}>
        <BooleanInput
          value={audioAnalysisComponent.midEnabled.value}
          onChange={commitProperty(AudioAnalysisComponent, 'midEnabled')}
        />
      </InputGroup>
      <InputGroup
        name="Mid Multiplier"
        label={t('editor:properties.audioAnalysis.lbl-midMultiplier')}
        childrenClassName="w-auto"
      >
        <Slider
          min={0}
          max={5}
          step={0.01}
          value={audioAnalysisComponent.midMultiplier.value}
          onChange={updateProperty(AudioAnalysisComponent, 'midMultiplier')}
          onRelease={commitProperty(AudioAnalysisComponent, 'midMultiplier')}
        />
      </InputGroup>
      <InputGroup name="Treble Enabled" label={t('editor:properties.audioAnalysis.lbl-trebleEnabled')}>
        <BooleanInput
          value={audioAnalysisComponent.trebleEnabled.value}
          onChange={commitProperty(AudioAnalysisComponent, 'trebleEnabled')}
        />
      </InputGroup>
      <InputGroup
        name="Treble Multiplier"
        label={t('editor:properties.audioAnalysis.lbl-trebleMultiplier')}
        childrenClassName="w-auto"
      >
        <Slider
          min={0}
          max={5}
          step={0.01}
          value={audioAnalysisComponent.trebleMultiplier.value}
          onChange={updateProperty(AudioAnalysisComponent, 'trebleMultiplier')}
          onRelease={commitProperty(AudioAnalysisComponent, 'trebleMultiplier')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

AudioAnalysisEditor.iconComponent = SiAudiomack

export default AudioAnalysisEditor
