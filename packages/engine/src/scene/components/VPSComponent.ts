import { defineComponent } from '../../ecs/functions/ComponentFunctions'

/** @todo - add vps scene info */

export const VPSComponent = defineComponent({
  name: 'VPSComponent',

  onInit: (entity) => {
    return null!
  },

  toJSON: () => {
    return null! as any
  }
})

export const SCENE_COMPONENT_SYSTEM = 'vps'
