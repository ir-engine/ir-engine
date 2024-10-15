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

import { useEffect } from 'react'

import { defineComponent, setComponent, useComponent, useEntityContext, useOptionalComponent } from '@ir-engine/ecs'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { PositionalAudioComponent } from '../../audio/components/PositionalAudioComponent'
import { AudioNodeGroups, MediaComponent, MediaElementComponent } from './MediaComponent'

export type AudioAnalysisSession = {
  analyser: AnalyserNode
  frequencyData: Uint8Array
}

export const AudioAnalysisComponent = defineComponent({
  name: 'EE_audio_analyzer',
  jsonID: 'audio-analyzer',

  schema: S.Object({
    src: S.String(''),
    session: S.Nullable(S.Type<AudioAnalysisSession>(), null),
    bassEnabled: S.Bool(true),
    midEnabled: S.Bool(true),
    trebleEnabled: S.Bool(true),
    bassMultiplier: S.Number(1),
    midMultiplier: S.Number(1),
    trebleMultiplier: S.Number(1)
  }),

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
