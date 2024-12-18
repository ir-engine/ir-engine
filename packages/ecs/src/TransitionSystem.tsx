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

import { defineAction, defineState, getMutableState, matches, none, useImmediateEffect } from '@ir-engine/hyperflux'
import React from 'react'
import { ComponentMap } from '..'
import { Easing, EasingFunctionPaths } from './EasingFunctions'
import { EntityUUID, matchesEntityUUID } from './Entity'
import { defineSystem } from './SystemFunctions'
import { AnimationSystemGroup } from './SystemGroups'
import { Transitionable } from './Transitionable'

type ComponentJsonID = string
type ComponentPropertyPath = string

export type TimestampedTargetValue<V> = {
  timestamp: number
  value: V
}

export interface TransitionData<T> {
  entityUUID: EntityUUID
  componentJsonID: ComponentJsonID
  propertyPath: ComponentPropertyPath
  propertyType: keyof typeof Transitionable
  targets: TimestampedTargetValue<T>[]
  duration: number
  nextTransitionAction: typeof TransitionActions.setTransition.matches._TYPE
}

export class TransitionActions {
  static setTransition = defineAction({
    type: 'ir.ecs.SET_TRANSITION' as const,
    entityUUID: matchesEntityUUID,
    componentJsonID: matches.string,
    propertyPath: matches.string,
    transitionableType: matches.guard<string, keyof typeof Transitionable>((v): v is keyof typeof Transitionable =>
      Object.keys(Transitionable).includes(v)
    ),
    target: matches.any,
    easing: matches.some(...EasingFunctionPaths.map((e) => matches.literal(e))).optional(),
    duration: matches.number.optional()
  })

  static removeTransition = defineAction({
    type: 'ir.ecs.REMOVE_TRANSITION' as const,
    entityUUID: matchesEntityUUID,
    componentJsonID: matches.string,
    propertyPath: matches.string
  })
}

export const TransitionState = defineState({
  name: 'TransitionState',
  initial: () => ({
    transitions: {} as Record<string, TransitionData<any>>,
    defaults: {
      easing: Easing.elastic.inOut,
      duration: 500
    }
  })
})

export const TransitionActionState = defineState({
  name: 'TransitionActionState',
  initial: () => ({}) as Record<string, typeof TransitionActions.setTransition.matches._TYPE>,
  receptors: {
    setTransition: TransitionActions.setTransition.receive((action) => {
      const transition = getMutableState(TransitionActionState)
      transition[`${action.entityUUID}-${action.componentJsonID}-${action.propertyPath}`].set(action)
    }),
    removeTransition: TransitionActions.removeTransition.receive((action) => {
      const transition = getMutableState(TransitionActionState)
      transition[`${action.entityUUID}-${action.componentJsonID}-${action.propertyPath}`].set(none)
    })
  }
})

export const TransitionSystem = defineSystem({
  uuid: 'TransitionSystem',
  execute: () => {},
  insert: {
    before: AnimationSystemGroup
  },
  reactor: () => {
    const transitionActionState = getMutableState(TransitionActionState)
    return (
      <>
        {Object.keys(transitionActionState).map((transitionID) => {
          const transition = transitionActionState[transitionID]
          return <TransitionReactor key={transitionID} transition={transition} />
        })}
      </>
    )
  }
})

const TransitionReactor = ({ transition }: { transition: typeof TransitionActions.setTransition.matches._TYPE }) => {
  useImmediateEffect(() => {
    const transitionState = getMutableState(TransitionState)
    const key = `${transition.entityUUID}-${transition.componentJsonID}-${transition.propertyPath}`
    if (!transitionState[key]) {
      const propertyType = getPropertyTypeFromSchema(transition.componentJsonID, transition.propertyPath)
      transitionState.transitions.nested(key).set({
        entityUUID: transition.entityUUID,
        componentJsonID: transition.componentJsonID,
        propertyPath: transition.propertyPath,
        propertyType,
        targets: transition.target.value,
        duration: transition.duration ?? transitionState.defaults.duration.value,
        nextTransitionAction: transition
      })
    }
    transitionState.nested(key).nextTransitionAction.set(transition)
    return () => {}
  }, [transition])
}

function getPropertyTypeFromSchema(componentJsonID: ComponentJsonID, propertyPath: ComponentPropertyPath) {
  const component = ComponentMap.get(componentJsonID)
  component?.schema
}
