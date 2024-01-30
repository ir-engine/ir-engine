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
  hasComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { getMutableState, none, useHookstate } from '@etherealengine/hyperflux/functions/StateFunctions'

import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { addObjectToGroup, removeObjectFromGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { setObjectLayers } from '@etherealengine/spatial/src/renderer/components/ObjectLayerComponent'
import { ObjectLayers } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import { AudioNodeGroups, MediaComponent, MediaElementComponent } from '../../scene/components/MediaComponent'
import { VolumetricComponent } from '../../scene/components/VolumetricComponent'
import { PositionalAudioHelper } from './PositionalAudioHelper'

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

  jsonID: 'audio',

  onInit: (entity) => {
    return {
      // default values as suggested at https://medium.com/@kfarr/understanding-web-audio-api-positional-audio-distance-models-for-webxr-e77998afcdff
      distanceModel: 'inverse' as DistanceModelType,
      rolloffFactor: 3,
      refDistance: 1,
      maxDistance: 40,
      coneInnerAngle: 360,
      coneOuterAngle: 0,
      coneOuterGain: 0,
      helper: null as PositionalAudioHelper | null
    }
  },

  onSet: (entity, component, json) => {
    if (hasComponent(entity, VolumetricComponent) || hasComponent(entity, MediaComponent)) return
    setComponent(entity, MediaComponent, {})

    if (!json) return
    if (typeof json.distanceModel === 'number' && component.distanceModel.value !== json.distanceModel)
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

  toJSON: (entity, component) => {
    return {
      distanceModel: component.distanceModel.value,
      rolloffFactor: component.rolloffFactor.value,
      refDistance: component.refDistance.value,
      maxDistance: component.maxDistance.value,
      coneInnerAngle: component.coneInnerAngle.value,
      coneOuterAngle: component.coneOuterAngle.value,
      coneOuterGain: component.coneOuterGain.value
    }
  },

  onRemove: (entity, component) => {
    if (component.helper.value) removeObjectFromGroup(entity, component.helper.value)
  },

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)
    const audio = useComponent(entity, PositionalAudioComponent)
    const mediaElement = useOptionalComponent(entity, MediaElementComponent)

    useEffect(() => {
      if (!debugEnabled.value || !mediaElement || !mediaElement.element.value) return

      const audioNodes = AudioNodeGroups.get(mediaElement.element.value)
      if (!audioNodes) return
      const helper = new PositionalAudioHelper(audioNodes)
      helper.name = `positional-audio-helper-${entity}`
      addObjectToGroup(entity, helper)
      setObjectLayers(helper, ObjectLayers.NodeHelper)
      audio.helper.set(helper)

      return () => {
        removeObjectFromGroup(entity, helper)
        audio.helper.set(none)
      }
    }, [debugEnabled, mediaElement?.element])

    useEffect(() => {
      if (!mediaElement?.element.value) return
      const audioNodes = AudioNodeGroups.get(mediaElement.element.value)
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
