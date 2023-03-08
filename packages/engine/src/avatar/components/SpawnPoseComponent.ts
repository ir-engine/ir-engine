import { Quaternion, Vector3 } from 'three'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const SpawnPoseComponent = defineComponent({
  name: 'SpawnPoseComponent',

  onInit: (entity) => {
    return {
      position: new Vector3(),
      rotation: new Quaternion()
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (json.position) component.position.set(json.position)
    if (json.rotation) component.rotation.set(json.rotation)
  }
})
