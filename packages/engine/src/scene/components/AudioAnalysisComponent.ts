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

import { useEffect } from 'react'

import {
  defineComponent,
  setComponent,
  useComponent,
  useEntityContext,
  useOptionalComponent
} from '@etherealengine/ecs'
import { TransformComponent } from '@etherealengine/spatial'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'

import { PositionalAudioComponent } from '../../audio/components/PositionalAudioComponent'
import { AudioNodeGroups, MediaComponent, MediaElementComponent } from './MediaComponent'

export type AudioAnalysisSession = {
  analyser: AnalyserNode
  frequencyData: Uint8Array
}

export const AudioAnalysisComponent = defineComponent({
  name: 'EE_audio_analyzer',
  jsonID: 'audio-analyzer',

  onInit: (entity) => {
    return {
      src: '' as string,
      session: null as AudioAnalysisSession | null,
      bassEnabled: true as boolean,
      midEnabled: true as boolean,
      trebleEnabled: true as boolean,
      bassMultiplier: 1 as number,
      midMultiplier: 1 as number,
      trebleMultiplier: 1 as number
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.src === 'string' && component.src.value !== json.src) {
      component.src.set(json.src)
    }
    if (typeof json.bassEnabled === 'boolean' && component.bassEnabled.value !== json.bassEnabled) {
      component.bassEnabled.set(json.bassEnabled)
    }
    if (typeof json.midEnabled === 'boolean' && component.midEnabled.value !== json.midEnabled) {
      component.midEnabled.set(json.midEnabled)
    }
    if (typeof json.trebleEnabled === 'boolean' && component.trebleEnabled.value !== json.trebleEnabled) {
      component.trebleEnabled.set(json.trebleEnabled)
    }
    if (typeof json.bassMultiplier === 'number' && component.bassMultiplier.value !== json.bassMultiplier) {
      component.bassMultiplier.set(json.bassMultiplier)
    }
    if (typeof json.midMultiplier === 'number' && component.midMultiplier.value !== json.midMultiplier) {
      component.midMultiplier.set(json.midMultiplier)
    }
    if (typeof json.trebleMultiplier === 'number' && component.trebleMultiplier.value !== json.trebleMultiplier) {
      component.trebleMultiplier.set(json.trebleMultiplier)
    }
  },

  toJSON: (entity, component) => {
    return {
      src: component.src.value,
      bassEnabled: component.bassEnabled.value,
      midEnabled: component.midEnabled.value,
      trebleEnabled: component.trebleEnabled.value,
      bassMultiplier: component.bassMultiplier.value,
      midMultiplier: component.midMultiplier.value,
      trebleMultiplier: component.trebleMultiplier.value
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const audioAnaylsisComponent = useComponent(entity, AudioAnalysisComponent)
    const posAudio = useOptionalComponent(entity, PositionalAudioComponent)
    const mediaElement = useOptionalComponent(entity, MediaElementComponent)
    const existingSystem = useComponent(entity, MediaComponent)

    useEffect(() => {
      setComponent(entity, VisibleComponent)
      setComponent(entity, NameComponent, 'AudioAnalysis')
      setComponent(entity, TransformComponent)
    }, [])

    useEffect(() => {
      audioAnaylsisComponent.src.set(existingSystem?.path.values[0])
    }, [existingSystem.path])

    useEffect(() => {
      if (!posAudio || !mediaElement?.value.element) return

      const element = mediaElement.value.element as HTMLAudioElement
      element.onplay = () => {
        const audioObject = AudioNodeGroups.get(element)

        if (audioObject) {
          const audioContext = audioObject.source.context
          const analyser = audioContext.createAnalyser()
          analyser.fftSize = 2 ** 5
          audioObject.source.connect(analyser)
          audioAnaylsisComponent.session.set({
            analyser,
            frequencyData: new Uint8Array(analyser.frequencyBinCount)
          })
        }
      }
    }, [audioAnaylsisComponent, posAudio, mediaElement])

    return null
  }
})
