import { defineComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'

export const FlyControlComponent = defineComponent({
  name: 'FlyControlComponent',

  onInit: (entity) => {
    return {
      moveSpeed: 1,
      boostSpeed: 1,
      lookSensitivity: 1,
      maxXRotation: Math.PI / 2
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (json.moveSpeed) component.moveSpeed.set(json.moveSpeed)
    if (json.boostSpeed) component.boostSpeed.set(json.boostSpeed)
    if (json.lookSensitivity) component.lookSensitivity.set(json.lookSensitivity)
    if (json.maxXRotation) component.maxXRotation.set(json.maxXRotation)
  }
})
