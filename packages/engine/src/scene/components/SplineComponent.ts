import { Vector3 } from 'three'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export type SplineComponentType = {
  splinePositions: Vector3[]
}

export const SplineComponent = defineComponent({
  name: 'SplineComponent',

  onInit: () => {
    return {
      splinePositions: [] as Vector3[]
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.splinePositions !== 'undefined')
      component.splinePositions.set(json.splinePositions.map((pos) => new Vector3(pos.x, pos.y, pos.z)))
  },

  toJSON(entity, component) {
    return {
      splinePositions: component.splinePositions.value
    }
  }
})

export const SCENE_COMPONENT_SPLINE = 'spline'
