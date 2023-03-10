import { useEffect } from 'react'
import { DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three'

import {
  defineComponent,
  hasComponent,
  useComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createState, getMutableState, none, useHookstate } from '@etherealengine/hyperflux/functions/StateFunctions'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { PositionalAudioHelper } from '../../debug/PositionalAudioHelper'
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
  name: 'XRE_positionalAudio',

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

  reactor: function ({ root }) {
    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)
    const audio = useComponent(root.entity, PositionalAudioComponent)
    const mediaElement = useComponent(root.entity, MediaElementComponent)

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
          helper.name = `positional-audio-helper-${root.entity}`
          setObjectLayers(helper, ObjectLayers.NodeHelper)
          addObjectToGroup(root.entity, helper)
          audio.helper.set(helper)
        }
      }

      if (!debugEnabled.value && audio.helper.value) {
        removeObjectFromGroup(root.entity, audio.helper.value)
        audio.helper.set(none)
      }
    }, [debugEnabled])

    return null
  }
})

export const SCENE_COMPONENT_AUDIO = 'audio'
