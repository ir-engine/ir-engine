/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { getState } from '@ir-engine/hyperflux'
import { defineComponent, getMutableComponent, hasComponent, setComponent } from './ComponentFunctions'
import { ECSState } from './ECSState'
import { Easing, EasingFunction } from './EasingFunctions'
import { Entity } from './Entity'
import { Transitionable, TransitionableTypes, getTransitionableKeyForType } from './Transitionable'
import { CreateSchemaValue } from './schemas/JSONSchemaUtils'
import { S } from './schemas/JSONSchemas'

export const TransitionComponent = defineComponent({
  name: 'TransitionComponent',

  jsonID: 'IR_transition',

  schema: S.Array(
    S.Object({
      componentJsonID: S.String(),
      propertyPath: S.String(),
      propertyType: S.String(),
      duration: S.Number(500),
      easing: S.String(Easing.exponential.inOut.path),
      targets: S.NonSerialized(
        S.Array(
          S.Object({
            timestamp: S.Number(),
            duration: S.Number(),
            easing: S.String(),
            to: S.Any()
          })
        )
      )
    })
  ),

  setTransition: function (
    entity: Entity,
    target: {
      componentJsonID: string
      propertyPath: string
      value: TransitionableTypes
      duration?: number
      easing?: EasingFunction
      type?: keyof typeof Transitionable
    }
  ) {
    const type = target.type ?? getTransitionableKeyForType(target.value)
    if (!type)
      throw new Error(
        `[setTransition]: Unknown transitionable type for ${target.componentJsonID} - ${target.propertyPath}`
      )
    const isType = Transitionable[type].isType(target)
    if (!isType)
      throw new Error(
        `[setTransition]: Invalid transitionable type for ${target.componentJsonID} - ${target.propertyPath}`
      )
    if (!hasComponent(entity, TransitionComponent)) {
      setComponent(entity, TransitionComponent)
    }
    const transitions = getMutableComponent(entity, TransitionComponent)
    let transition = transitions.find(
      (t) => t.componentJsonID.value === target.componentJsonID && t.propertyPath.value === target.propertyPath
    )
    if (!transition) {
      const t = CreateSchemaValue(TransitionComponent.schema.properties)
      transitions.merge([t])
      transition = transitions[transitions.length - 1]
    }
    if (target.duration && transition.duration.value !== target.duration) transition.duration.set(target.duration)
    if (target.easing && transition.easing.value !== target.easing.path) transition.easing.set(target.easing.path)
    const ecs = getState(ECSState)
    transition.targets.merge([
      {
        timestamp: ecs.frameTime,
        duration: transition.duration.value,
        easing: transition.easing.value,
        to: target.value
      }
    ])
  }
})
