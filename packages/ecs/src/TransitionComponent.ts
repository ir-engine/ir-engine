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

import { resolveObject } from '@ir-engine/hyperflux'
import {
  ComponentJSONIDMap,
  defineComponent,
  getComponent,
  getMutableComponent,
  hasComponent,
  setComponent
} from './ComponentFunctions'
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
      transitionableType: S.String(),
      duration: S.Number(500),
      easing: S.String(Easing.exponential.inOut.path),
      initialValue: S.NonSerialized(S.Type<TransitionableTypes>()),
      outputValue: S.NonSerialized(S.Type<TransitionableTypes>()),
      events: S.NonSerialized(
        S.Array(
          S.Object({
            age: S.Number(),
            fromValue: S.Type<TransitionableTypes>(),
            toValue: S.Type<TransitionableTypes>(),
            duration: S.Number(),
            easing: S.String()
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
    if (target.type && transition.transitionableType.value !== type) transition.transitionableType.set(type)
    TransitionComponent.update(entity, 0)
    transition.events.merge([
      {
        age: 0,
        duration: transition.duration.value,
        easing: transition.easing.value,
        fromValue: transition.outputValue.value,
        toValue: target.value
      }
    ])
  },

  update(entity: Entity, dt: number) {
    const transitions = getComponent(entity, TransitionComponent)

    for (const transition of transitions) {
      const Component = ComponentJSONIDMap.get(transition.componentJsonID)
      if (!Component) continue
      const property = resolveObject(Component, transition.propertyPath) as any as TransitionableTypes
      if (!property) continue

      if (!transition.initialValue) {
        transition.initialValue = structuredClone(property)
      }

      if (transition.events.length === 0) {
        transition.outputValue = transition.initialValue
        continue
      }

      const latestEvent = transition.events[transition.events.length - 1]

      let totalWeight = 0
      let weightedValue: TransitionableTypes | null = null

      const transitionable = Transitionable[transition.transitionableType] as Transitionable

      const addWeighted = (value: TransitionableTypes, weight: number) => {
        if (weightedValue === null) {
          weightedValue = transitionable.scale(value, weight)
        } else {
          weightedValue = transitionable.add(weightedValue, transitionable.scale(value, weight))
        }
        totalWeight += weight
      }

      for (let i = 0; i < transition.events.length; i++) {
        const ev = transition.events[i]
        ev.age += dt
        const clampedT = Math.min(Math.max(ev.age / ev.duration, 0), 1)
        const easedT = ev.easing(clampedT)
        const value = transitionable.interpolate(ev.fromValue, ev.toValue, easedT)

        // Weight calculation:
        let weight = 1
        if (i < transition.events.length - 1) {
          // Not the latest event, fade out based on how far the latest event has progressed
          const fadeFactor = 1 - Math.min(latestEvent.age / latestEvent.duration, 1)
          weight = fadeFactor
        }

        if (weight > 0) {
          addWeighted(value, weight)
        }
      }

      if (totalWeight === 0 && weightedValue === null) {
        // No active contribution, use initial value
        transition.outputValue = transition.initialValue
      }

      // normalize by scaling by the total weight
      const output = transitionable.scale(weightedValue!, 1 / totalWeight)

      // **Cleanup Logic:**
      // If the latest event has fully completed, we can finalize and clean up.
      if (latestEvent.age >= latestEvent.duration) {
        // The latest event is done, which means all older events are at zero weight now.
        // Set the final stable output as the new initialValue.
        this.initialValue = output
        // Clear the events array, as we've reached a stable state.
        this.events = []
      }

      transition.outputValue = output
    }
  }
})
