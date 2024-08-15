import { defineComponent } from '@etherealengine/ecs'
import { VRM } from '@pixiv/three-vrm'

export const VRMComponent = defineComponent({
  name: 'VRMComponent',

  onInit(entity) {
    return null! as VRM
  },

  onSet(entity, component, json) {
    if (!(json instanceof VRM)) throw new Error('Invalid VRM')
    component.set(json as VRM)
  }
})
