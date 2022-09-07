import { defineComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createState } from '@xrengine/hyperflux/functions/StateFunctions'

export const PositionalAudioComponent = defineComponent({
  name: 'XRE_positionalAudio',

  onAdd: (entity, json) => {
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
    state.merge(json)
    return state
  },

  onRemove: (entity, component) => {
    component.destroy()
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
  }
})

export const SCENE_COMPONENT_AUDIO = 'audio'
