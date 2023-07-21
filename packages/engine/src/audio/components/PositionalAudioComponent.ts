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

import { defineComponent, useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { getMutableState, none, useHookstate } from '@etherealengine/hyperflux/functions/StateFunctions'

import { PositionalAudioHelper } from '../../debug/PositionalAudioHelper'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { RendererState } from '../../renderer/RendererState'
import { addObjectToGroup, removeObjectFromGroup } from '../../scene/components/GroupComponent'
import { AudioNodeGroups, MediaElementComponent } from '../../scene/components/MediaComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'

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
    const mediaElement = useComponent(entity, MediaElementComponent)

    useEffect(() => {
      if (
        debugEnabled.value &&
        !audio.helper.value &&
        mediaElement.element.value &&
        AudioNodeGroups.has(mediaElement.element.value)
      ) {
        const audioNodes = AudioNodeGroups.get(mediaElement.element.value)
        if (audioNodes) {
          const helper = new PositionalAudioHelper(audioNodes)
          helper.name = `positional-audio-helper-${entity}`
          setObjectLayers(helper, ObjectLayers.NodeHelper)
          addObjectToGroup(entity, helper)
          audio.helper.set(helper)
        }
      }

      if (!debugEnabled.value && audio.helper.value) {
        removeObjectFromGroup(entity, audio.helper.value)
        audio.helper.set(none)
      }
    }, [debugEnabled])

    return null
  }
})
