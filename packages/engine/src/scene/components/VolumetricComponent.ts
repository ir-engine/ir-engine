import { subscribable } from '@hookstate/subscribable'

import { hookstate, StateMethodsDestroy } from '@xrengine/hyperflux/functions/StateFunctions'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const VolumetricComponent = defineComponent({
  name: 'XRE_volumetric',

  onAdd: (entity) => {
    const state = hookstate(
      {
        useLoadingEffect: false
      },
      subscribable()
    )
    return state
  },

  toJSON: (entity, component) => {
    return {
      useLoadingEffect: component.useLoadingEffect.value
    }
  },

  onUpdate: (entity, component, json) => {
    component.useLoadingEffect.set(json.useLoadingEffect)
  },

  onRemove: (entity, component) => {
    ;(component as typeof component & StateMethodsDestroy).destroy()
  }
})

export const VolumetricsExtensions = ['drcs', 'uvol']
export const SCENE_COMPONENT_VOLUMETRIC = 'volumetric'
