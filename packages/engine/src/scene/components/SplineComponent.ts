import { Vector3 } from 'three'

import { matches } from '../../common/functions/MatchesUtils'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'
import Spline from '../classes/Spline'
import { ObjectLayers } from '../constants/ObjectLayers'
import { setObjectLayers } from '../functions/setObjectLayers'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'

export const SplineComponent = defineComponent({
  name: 'SplineComponent',

  onInit: (entity) => {
    const splinePositions = [] as Vector3[]
    const splineDivisions = [] as Vector3[]
    const spline = new Spline(splinePositions)
    spline.name = `spline-helper-${entity}`
    addObjectToGroup(entity, spline)
    setObjectLayers(spline, ObjectLayers.NodeHelper)

    return {
      splinePositions,
      splineDivisions,
      divisions: 200,
      spline
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.number.test(json.divisions)) {
      component.divisions.set(json.divisions)
    }
    if (matches.array.test(json.splinePositions)) {
      const points = [] as Vector3[]
      for (const pos of json.splinePositions) points.push(new Vector3(pos.x, pos.y, pos.z))
      component.splinePositions.set(points)
      component.spline.value.load(component.splinePositions.value)
      component.splineDivisions.set(component.spline.value.curve.getSpacedPoints(component.divisions.value))
    }
  },

  toJSON: (entity, component) => {
    return {
      splinePositions: component.spline.value._splineHelperObjects.map((obj) => obj.position),
      divisions: component.divisions.value
    }
  },

  onRemove: (entity, component) => {
    removeObjectFromGroup(entity, component.spline.value)
  }
})

export const SCENE_COMPONENT_SPLINE = 'spline'
