import { Vector3 } from 'three'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const DropShadowComponent = defineComponent({
  name: 'DropShadowComponent',
  onInit: (entity) => {
    return {
      radius: 0,
      center: undefined as Vector3 | undefined,
      bias: 2
    }
  }
})
