import type { WebContainer3D } from '@etherealjs/web-layer/three'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'
import { XRUIManager } from '../classes/XRUIManager'

export const XRUIComponent = defineComponent({
  name: 'XRUIComponent',

  onInit: (entity) => {
    return null! as WebContainer3D
  },

  onSet: (entity, component, json: WebContainer3D) => {
    if (typeof json !== 'undefined') {
      component.set(json)
      component.value.interactionRays = XRUIManager.instance.interactionRays
    }
  },

  onRemove: (entity, component) => {
    component.value.destroy()
  }
})
