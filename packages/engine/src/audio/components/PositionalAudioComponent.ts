import { defineComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createState } from '@xrengine/hyperflux/functions/StateFunctions'

export const PositionalAudioComponent = defineComponent({
  name: 'XRE_positionalAudio',

  onAdd: (entity, json) => {
    const state = createState({
      distanceModel: 'linear' as DistanceModelType,
      rolloffFactor: 1,
      refDistance: 20,
      maxDistance: 1000,
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
