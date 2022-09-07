import { subscribable } from '@hookstate/subscribable'

import { hookstate, StateMethodsDestroy } from '@xrengine/hyperflux/functions/StateFunctions'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const VolumetricComponent = defineComponent({
  name: 'XRE_volumetric',

  onAdd: (entity, json) => {
    const state = hookstate(
      {
        useLoadingEffect: false
      },
      subscribable()
    )
    state.merge(json)
    return state
  },

  onRemove: (entity, component) => {
    ;(component as typeof component & StateMethodsDestroy).destroy()
  },

  toJSON: (entity, component) => {
    return {
      useLoadingEffect: component.useLoadingEffect.value
    }
  }
})

export const VolumetricsExtensions = ['drcs', 'uvol']
export const SCENE_COMPONENT_VOLUMETRIC = 'volumetric'
