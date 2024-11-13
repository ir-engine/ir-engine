/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@ir-engine/ecs'
import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { AudioAnalysisComponent } from '@ir-engine/engine/src/scene/components/AudioAnalysisComponent'
import { Checkbox } from '@ir-engine/ui'
import { Slider } from '@ir-engine/ui/editor'
import { SiAudiomack } from 'react-icons/si'
import InputGroup from '../../../input/Group'

export const AudioAnalysisEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const audioAnalysisComponent = useComponent(props.entity, AudioAnalysisComponent)

  return (
    <NodeEditor {...props} name={t('editor:properties.audioAnalysis.name')} Icon={AudioAnalysisEditor.iconComponent}>
      <InputGroup name="Bass" label={t('editor:properties.audioAnalysis.lbl-bassEnabled')}>
        <Checkbox
          checked={audioAnalysisComponent.bassEnabled.value}
          onChange={commitProperty(AudioAnalysisComponent, 'bassEnabled')}
        />
      </InputGroup>
      <Slider
        min={0}
        max={5}
        step={0.01}
        value={audioAnalysisComponent.bassMultiplier.value}
        onChange={updateProperty(AudioAnalysisComponent, 'bassMultiplier')}
        onRelease={commitProperty(AudioAnalysisComponent, 'bassMultiplier')}
        aria-label="Bass Multiplier"
        label={t('editor:properties.audioAnalysis.lbl-bassMultiplier')}
      />
      <InputGroup name="Mid Enabled" label={t('editor:properties.audioAnalysis.lbl-midEnabled')}>
        <Checkbox
          checked={audioAnalysisComponent.midEnabled.value}
          onChange={commitProperty(AudioAnalysisComponent, 'midEnabled')}
        />
      </InputGroup>
      <Slider
        aria-label="Mid Multiplier"
        label={t('editor:properties.audioAnalysis.lbl-midMultiplier')}
        min={0}
        max={5}
        step={0.01}
        value={audioAnalysisComponent.midMultiplier.value}
        onChange={updateProperty(AudioAnalysisComponent, 'midMultiplier')}
        onRelease={commitProperty(AudioAnalysisComponent, 'midMultiplier')}
      />
      <InputGroup name="Treble Enabled" label={t('editor:properties.audioAnalysis.lbl-trebleEnabled')}>
        <Checkbox
          checked={audioAnalysisComponent.trebleEnabled.value}
          onChange={commitProperty(AudioAnalysisComponent, 'trebleEnabled')}
        />
      </InputGroup>
      <Slider
        label={t('editor:properties.audioAnalysis.lbl-trebleMultiplier')}
        min={0}
        max={5}
        step={0.01}
        value={audioAnalysisComponent.trebleMultiplier.value}
        onChange={updateProperty(AudioAnalysisComponent, 'trebleMultiplier')}
        onRelease={commitProperty(AudioAnalysisComponent, 'trebleMultiplier')}
        aria-label="Treble Multiplier"
      />
    </NodeEditor>
  )
}

AudioAnalysisEditor.iconComponent = SiAudiomack

export default AudioAnalysisEditor
