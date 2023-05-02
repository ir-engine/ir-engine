import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const VolumetricComponent = defineComponent({
  name: 'EE_volumetric',
  jsonID: 'volumetric',

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
  }
})

export const VolumetricsExtensions = ['drcs', 'uvol', 'manifest']
