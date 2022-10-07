import { defineComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createState } from '@xrengine/hyperflux/functions/StateFunctions'

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

  onAdd: (entity) => {
    const state = createState({
      // default values as suggested at https://medium.com/@kfarr/understanding-web-audio-api-positional-audio-distance-models-for-webxr-e77998afcdff
      distanceModel: 'inverse' as DistanceModelType,
      rolloffFactor: 3,
      refDistance: 1,
      maxDistance: 40,
      coneInnerAngle: 360,
      coneOuterAngle: 0,
      coneOuterGain: 0
    })
    return state
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

  onUpdate: (entity, component, json) => {
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

  onRemove: (entity, component) => {
    component.destroy()
  }
})

export const SCENE_COMPONENT_AUDIO = 'audio'
