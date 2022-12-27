import { Vector3 } from 'three'

import { getState } from '@xrengine/hyperflux'

import { matches } from '../../common/functions/MatchesUtils'
import { defineComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { EngineRendererState } from '../../renderer/EngineRendererState'
import Spline from '../classes/Spline'
import { ObjectLayers } from '../constants/ObjectLayers'
import { setObjectLayers } from '../functions/setObjectLayers'
import { setCallback } from './CallbackComponent'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'
import { UpdatableCallback, UpdatableComponent } from './UpdatableComponent'

export const SplineComponent = defineComponent({
  name: 'SplineComponent',

  onInit: (entity) => {
    const splinePositions = [] as Vector3[]
    const spline = new Spline()
    spline.name = `spline-helper-${entity}`
    spline.init(splinePositions)
    addObjectToGroup(entity, spline)
    setObjectLayers(spline, ObjectLayers.NodeHelper)

    return {
      splinePositions,
      spline
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.array.test(json.splinePositions)) {
      const points = [] as Vector3[]
      for (const pos of json.splinePositions) points.push(new Vector3(pos.x, pos.y, pos.z))
      component.splinePositions.set(points)
      component.spline.value.init(component.splinePositions.value)
    }
  },

  toJSON: (entity, component) => {
    return {
      splinePositions: component.splinePositions.value
    }
  },

  onRemove: (entity, component) => {
    removeObjectFromGroup(entity, component.spline.value)
  }
})

export const SCENE_COMPONENT_SPLINE = 'spline'
