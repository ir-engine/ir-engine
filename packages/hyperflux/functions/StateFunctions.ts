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

import { createState, SetInitialStateAction, State, StateMethods, useHookstate } from '@hookstate/core'
import type { Object as _Object, Function, String } from 'ts-toolbelt'

import { DeepReadonly } from '@etherealengine/common/src/DeepReadonly'
import { resolveObject } from '@etherealengine/common/src/utils/resolveObject'
import { isClient } from '@etherealengine/engine/src/common/functions/getEnvironment'
import multiLogger from '@etherealengine/engine/src/common/functions/logger'

import { InputSystemGroup } from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { ActionQueueHandle, ActionReceptor, defineActionQueue } from './ActionFunctions'
import { HyperFlux, HyperStore } from './StoreFunctions'

export * from '@hookstate/core'

const logger = multiLogger.child({ component: 'hyperflux:State' })

export const NO_PROXY = { noproxy: true }

export type ReceptorMap = Record<string, ActionReceptor<any>>

export type StateDefinition<S, Receptors extends ReceptorMap> = {
  name: string
  initial: SetInitialStateAction<S>
  receptors?: Receptors
  receptorActionQueue?: ActionQueueHandle
  onCreate?: (store: HyperStore, state: StateMethods<S>) => void
}

export const StateDefinitions = new Map<string, StateDefinition<any, ReceptorMap>>()

export function defineState<S, R extends ReceptorMap, StateExtras = unknown>(
  definition: StateDefinition<S, R> & StateExtras
) {
  if (StateDefinitions.has(definition.name)) throw new Error(`State ${definition.name} already defined`)
  StateDefinitions.set(definition.name, definition)
  if (HyperFlux.store) initializeState(definition)
  return definition as StateDefinition<S, R> & { _TYPE: S } & StateExtras
}

export function initializeState<S, R extends ReceptorMap>(StateDefinition: StateDefinition<S, R>) {
  if (HyperFlux.store.stateMap[StateDefinition.name]) return

  logger.info(`initializeState ${StateDefinition.name}`)

  const setInitial = () => {
    const initial =
      typeof StateDefinition.initial === 'function'
        ? (StateDefinition.initial as any)()
        : JSON.parse(JSON.stringify(StateDefinition.initial))
    HyperFlux.store.valueMap[StateDefinition.name] = initial
    if (HyperFlux.store.stateMap[StateDefinition.name]) {
      HyperFlux.store.stateMap[StateDefinition.name].set(initial)
    } else {
      HyperFlux.store.stateMap[StateDefinition.name] = createState(HyperFlux.store.valueMap[StateDefinition.name])
    }
  }

  setInitial()

  HyperFlux.store.stateMap[StateDefinition.name].attach(() => ({
    id: Symbol('update root state value map'),
    init: () => ({
      onSet(arg) {
        if (arg.path.length === 0 && typeof arg.value === 'object')
          HyperFlux.store.valueMap[StateDefinition.name] = arg.value
      }
    })
  }))
  if (StateDefinition.onCreate) StateDefinition.onCreate(HyperFlux.store, getMutableState(StateDefinition))

  if (StateDefinition.receptors) {
    const queue = defineActionQueue(Object.values(StateDefinition.receptors).map((r) => r.matchesAction))

    defineSystem({
      uuid: `${StateDefinition.name}.actionReceptor`,
      insert: { before: InputSystemGroup },
      execute: () => {
        // queue may need to be reset when actions are recieved out of order
        // or when state needs to be rolled back
        if (queue.needsReset) {
          // reset the state to the initial value when the queue is reset
          setInitial()
          queue.reset()
        }
        // apply each action to each matching receptor, in order
        for (const action of queue()) {
          for (const receptor of Object.values(StateDefinition.receptors!)) {
            receptor.matchesAction.test(action) && receptor(action)
          }
        }
      }
    })
  }
}

export function getMutableState<S, R extends ReceptorMap>(StateDefinition: StateDefinition<S, R>) {
  if (!HyperFlux.store.stateMap[StateDefinition.name]) initializeState(StateDefinition)
  return HyperFlux.store.stateMap[StateDefinition.name] as State<S>
}

export function getState<S, R extends ReceptorMap>(StateDefinition: StateDefinition<S, R>) {
  if (!HyperFlux.store.stateMap[StateDefinition.name]) initializeState(StateDefinition)
  return HyperFlux.store.valueMap[StateDefinition.name] as DeepReadonly<S>
}

export function useMutableState<S, R extends ReceptorMap, P extends string>(
  StateDefinition: StateDefinition<S, R>
): State<S>
export function useMutableState<S, R extends ReceptorMap, P extends string>(
  StateDefinition: StateDefinition<S, R>,
  path: Function.AutoPath<State<S>, P>
): _Object.Path<State<S>, String.Split<P, '.'>>
export function useMutableState<S, R extends ReceptorMap, P extends string>(
  StateDefinition: StateDefinition<S, R>,
  path?: Function.AutoPath<State<S>, P>
): _Object.Path<State<S>, String.Split<P, '.'>> {
  const rootState = getMutableState(StateDefinition)
  const resolvedState = path ? resolveObject(rootState, path as any) : rootState
  return useHookstate(resolvedState) as any
}

const stateNamespaceKey = 'ee.hyperflux'

/**
 * Automatically synchronises specific root paths of a hyperflux state definition with the localStorage.
 * Values get automatically populated if they exist in localStorage and saved when they are changed.
 * @param {StateDefinition} stateDefinition
 * @param {string[]} keys the root paths to synchronise
 *
 * TODO: #7384 this api need to be revisited; we are syncing local state without doing any validation,
 * so if we ever change the acceptable values for a given state key, we will have to do a migration
 * or fallback to a default value, but we can't do that without knowing what the acceptable values are, which means
 * we need to pass in a schema or validator function to this function (we should use ts-pattern for this).
 */
export const syncStateWithLocalStorage = (
  stateDefinition: ReturnType<typeof defineState<any, any>>,
  keys: string[]
) => {
  if (!isClient) return
  const state = getMutableState(stateDefinition)

  for (const key of keys) {
    const storedValue = localStorage.getItem(`${stateNamespaceKey}.${stateDefinition.name}.${key}`)
    if (storedValue !== null && storedValue !== 'undefined') state[key].set(JSON.parse(storedValue))
  }

  state.attach(() => ({
    id: Symbol('syncStateWithLocalStorage'),
    init: () => ({
      onSet(arg) {
        for (const key of keys) {
          if (state[key].value === undefined)
            localStorage.removeItem(`${stateNamespaceKey}.${stateDefinition.name}.${key}`)
          else
            localStorage.setItem(
              `${stateNamespaceKey}.${stateDefinition.name}.${key}`,
              JSON.stringify(state[key].get({ noproxy: true }))
            )
        }
      }
    })
  }))
}
