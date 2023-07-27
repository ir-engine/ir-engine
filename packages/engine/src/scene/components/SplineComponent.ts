/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
