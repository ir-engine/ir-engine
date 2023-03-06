import { StateMethodsDestroy } from '@etherealengine/hyperflux/functions/StateFunctions'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const VolumetricComponent = defineComponent({
  name: 'XRE_volumetric',

  onInit: (entity) => {
    return {
      useLoadingEffect: false
    }
  },

  toJSON: (entity, component) => {
    return {
      useLoadingEffect: component.useLoadingEffect.value
    }
  },

  onSet: (entity, component, json) => {
    if (typeof json?.useLoadingEffect === 'boolean' && json.useLoadingEffect !== component.useLoadingEffect.value)
      component.useLoadingEffect.set(json.useLoadingEffect)
  },

  onRemove: (entity, component) => {
    ;(component as typeof component & StateMethodsDestroy).destroy()
  }
})

export const VolumetricsExtensions = ['drcs', 'uvol']
export const SCENE_COMPONENT_VOLUMETRIC = 'volumetric'
