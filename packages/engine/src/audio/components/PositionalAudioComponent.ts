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

import {
  defineComponent,
  getOptionalComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { AudioNodeGroups, MediaElementComponent } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'

import { PositionalAudioHelperComponent } from './PositionalAudioHelperComponent'

export interface PositionalAudioInterface {
  refDistance: number
  rolloffFactor: number
  maxDistance: number
  distanceModel: DistanceModelType
  coneInnerAngle: number
  coneOuterAngle: number
  coneOuterGain: number
}

export const PositionalAudioComponent = defineComponent({
  name: 'EE_positionalAudio',

  jsonID: 'EE_audio',

  onInit: (entity) => {
    return {
      // default values as suggested at https://medium.com/@kfarr/understanding-web-audio-api-positional-audio-distance-models-for-webxr-e77998afcdff
      distanceModel: 'inverse' as DistanceModelType,
      rolloffFactor: 3,
      refDistance: 1,
      maxDistance: 40,
      coneInnerAngle: 360,
      coneOuterAngle: 0,
      coneOuterGain: 0
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.distanceModel === 'string' && component.distanceModel.value !== json.distanceModel)
      component.distanceModel.set(json.distanceModel)
    if (typeof json.rolloffFactor === 'number' && component.rolloffFactor.value !== json.rolloffFactor)
      component.rolloffFactor.set(json.rolloffFactor)
    if (typeof json.refDistance === 'number' && component.refDistance.value !== json.refDistance)
      component.refDistance.set(json.refDistance)
    if (typeof json.maxDistance === 'number' && component.maxDistance.value !== json.maxDistance)
      component.maxDistance.set(json.maxDistance)
    if (typeof json.coneInnerAngle === 'number' && component.coneInnerAngle.value !== json.coneInnerAngle)
      component.coneInnerAngle.set(json.coneInnerAngle)
    if (typeof json.coneOuterAngle === 'number' && component.coneOuterAngle.value !== json.coneOuterAngle)
      component.coneOuterAngle.set(json.coneOuterAngle)
    if (typeof json.coneOuterGain === 'number' && component.coneOuterGain.value !== json.coneOuterGain)
      component.coneOuterGain.set(json.coneOuterGain)
  },

  toJSON: (component) => {
    return {
      distanceModel: component.distanceModel,
      rolloffFactor: component.rolloffFactor,
      refDistance: component.refDistance,
      maxDistance: component.maxDistance,
      coneInnerAngle: component.coneInnerAngle,
      coneOuterAngle: component.coneOuterAngle,
      coneOuterGain: component.coneOuterGain
    }
  },

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)
    const audio = useComponent(entity, PositionalAudioComponent)
    const mediaElement = useOptionalComponent(entity, MediaElementComponent)

    useEffect(() => {
      if (debugEnabled.value) {
        if (!mediaElement || !mediaElement.element.value) return
        const audioNodes = AudioNodeGroups.get(mediaElement.element.value as HTMLMediaElement)
        if (!audioNodes) return
        const name = getOptionalComponent(entity, NameComponent)
        setComponent(entity, PositionalAudioHelperComponent, {
          audio: audioNodes,
          name: name ? `${name}-positional-audio-helper` : undefined
        })
      }

      return () => {
        removeComponent(entity, PositionalAudioHelperComponent)
      }
    }, [debugEnabled, mediaElement?.element])

    useEffect(() => {
      if (!mediaElement?.element.value) return
      const audioNodes = AudioNodeGroups.get(mediaElement.element.value as HTMLMediaElement)
      if (!audioNodes?.panner) return
      audioNodes.panner.refDistance = audio.refDistance.value
      audioNodes.panner.rolloffFactor = audio.rolloffFactor.value
      audioNodes.panner.maxDistance = audio.maxDistance.value
      audioNodes.panner.distanceModel = audio.distanceModel.value
      audioNodes.panner.coneInnerAngle = audio.coneInnerAngle.value
      audioNodes.panner.coneOuterAngle = audio.coneOuterAngle.value
      audioNodes.panner.coneOuterGain = audio.coneOuterGain.value
    }, [
      audio.refDistance,
      audio.rolloffFactor,
      audio.maxDistance,
      audio.distanceModel,
      audio.coneInnerAngle,
      audio.coneOuterAngle,
      audio.coneOuterGain
    ])

    return null
  }
})
