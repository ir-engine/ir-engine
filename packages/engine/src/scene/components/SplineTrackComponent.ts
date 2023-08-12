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

import { useExecute } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { Quaternion } from 'three'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  useComponent
} from '../../ecs/functions/ComponentFunctions'
import { PresentationSystemGroup } from '../../ecs/functions/EngineFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { LocalTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
import { SplineComponent } from './SplineComponent'

export const SplineTrackComponent = defineComponent({
  name: 'SplineTrackComponent',
  jsonID: 'spline-track',

  onInit: (entity) => {
    return {
      alpha: 0.01,
      velocity: 1.0,
      disableRoll: false,
      disableRunning: false
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    json.velocity && component.velocity.set(json.velocity)
    json.alpha && component.alpha.set(json.alpha)
    json.disableRoll && component.disableRoll.set(json.disableRoll)
    json.disableRunning && component.disableRunning.set(json.disableRunning)
  },

  toJSON: (entity, component) => {
    return {
      velocity: component.velocity.value,
      alpha: component.alpha.value,
      disableRoll: component.disableRoll.value,
      disableRunning: component.disableRunning.value
    }
  },

  onRemove: (entity, component) => {},

  reactor: function (props) {
    const entity = useEntityContext()
    const component = useComponent(entity, SplineTrackComponent)

    useExecute(
      () => {
        // get local transform for this entity
        const local = getOptionalComponent(entity, LocalTransformComponent)
        const transform = getOptionalComponent(entity, TransformComponent)
        if (!transform) return

        // look at parent first then at self for a splineComponent
        const tree = getComponent(entity, EntityTreeComponent)
        if (!tree || !tree.parentEntity) return null
        let splineComponent = getOptionalComponent(tree.parentEntity, SplineComponent)
        if (!splineComponent) splineComponent = getOptionalComponent(entity, SplineComponent)
        if (!splineComponent) return
        const elements = splineComponent.elements
        if (elements.length < 2) return

        // move
        const alpha = component.alpha.value
        const index = Math.floor(component.alpha.value)
        if (index > elements.length - 2) {
          component.alpha.set(0)
          return
        }
        if (!component.disableRunning.value) {
          component.alpha.set(alpha + 0.01 * component.velocity.value)
        }
        const p1 = elements[index].position
        const p2 = elements[index + 1].position
        const q1 = elements[index].quaternion
        const q2 = elements[index + 1].quaternion

        // @todo replace naive lerp with a spline division based calculation
        if (local) {
          local.position.lerpVectors(p1, p2, alpha - index) //.add(transform.position).y -= 1
          if (!component.disableRoll.value)
            local.rotation.copy(new Quaternion().slerpQuaternions(q1, q2, alpha - index))
        } else {
          transform.position.lerpVectors(p1, p2, alpha - index) //.add(transform.position).y -= 1
          if (!component.disableRoll.value)
            transform.rotation.copy(new Quaternion().slerpQuaternions(q1, q2, alpha - index))
        }
      },
      { with: PresentationSystemGroup }
    )

    return null
  }
})
