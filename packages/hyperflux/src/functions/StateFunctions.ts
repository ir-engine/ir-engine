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

import { extend, ExtensionFactory, hookstate, SetInitialStateAction, State, useHookstate } from '@hookstate/core'
import { Identifiable, identifiable } from '@hookstate/identifiable'
import type { Object as _Object, Function, String } from 'ts-toolbelt'

import { DeepReadonly } from '../types/DeepReadonly'
import { ActionQueueHandle, ActionReceptor } from './ActionFunctions'
import { isClient } from './EnvironmentConstants'
import { startReactor } from './ReactorFunctions'
import { HyperFlux, HyperStore } from './StoreFunctions'

export * from '@hookstate/core'
export { useHookstate as useState } from '@hookstate/core'
export * from '@hookstate/identifiable'

/** @deprecated */
export const createState = hookstate

export const NO_PROXY = { noproxy: true }
export const NO_PROXY_STEALTH = { noproxy: true, stealth: true }

export type ReceptorMap = Record<string, ActionReceptor<any>>

export type StateDefinition<S, I, E, Receptors extends ReceptorMap> = {
  name: string
  initial: SetInitialStateAction<S>
  extension?: ExtensionFactory<S, I, E>
  receptors?: Receptors
  receptorActionQueue?: ActionQueueHandle
  reactor?: any // why does React.FC break types?
  /** @deprecated use `extension` */
  onCreate?: (store: HyperStore, state: State<S, I & E>) => void
}

export const StateDefinitions = new Map<string, StateDefinition<any, any, any, any>>()

export const setInitialState = (def: StateDefinition<any, any, any, any>) => {
  const initial = typeof def.initial === 'function' ? (def.initial as any)() : JSON.parse(JSON.stringify(def.initial))
  if (HyperFlux.store.stateMap[def.name]) {
    HyperFlux.store.stateMap[def.name].set(initial)
  } else {
    const state = (HyperFlux.store.stateMap[def.name] = hookstate(
      initial,
      extend(identifiable(def.name), def.extension)
    ))
    if (def.onCreate) def.onCreate(HyperFlux.store, state)
    if (def.reactor) {
      const reactor = startReactor(def.reactor)
      HyperFlux.store.stateReactors[def.name] = reactor
    }
  }
}

export function defineState<S, I, E, R extends ReceptorMap, StateExtras = Record<string, any>>(
  definition: StateDefinition<S, I, E, R> & StateExtras
) {
  if (StateDefinitions.has(definition.name)) throw new Error(`State ${definition.name} already defined`)
  StateDefinitions.set(definition.name, definition)
  return definition as StateDefinition<S, I, E, R> & { _TYPE: S } & StateExtras
}

export function getMutableState<S, I, E, R extends ReceptorMap>(StateDefinition: StateDefinition<S, I, E, R>) {
  if (!HyperFlux.store.stateMap[StateDefinition.name]) setInitialState(StateDefinition)
  return HyperFlux.store.stateMap[StateDefinition.name] as State<S, I & E & Identifiable>
}

export function getState<S>(StateDefinition: StateDefinition<S, any, any, any>) {
  if (!HyperFlux.store.stateMap[StateDefinition.name]) setInitialState(StateDefinition)
  return HyperFlux.store.stateMap[StateDefinition.name].get(NO_PROXY_STEALTH) as DeepReadonly<S>
}

export type Paths<S> = S extends object
  ? {
      [K in keyof S]: K extends string ? [K, ...Paths<S[K]>] : never
    }[keyof S]
  : []

export function resolveObject<O extends object, P extends string>(
  obj: O,
  path: Function.AutoPath<O, P>
): _Object.Path<O, String.Split<P, '.'>> {
  const keyPath = Array.isArray(path) ? path : path.split('.')
  return keyPath.reduce((prev, curr) => prev?.[curr], obj as any)
}

export function getNestedObject(object: any, propertyName: string) {
  const props = propertyName.split('.')
  let result = object

  for (let i = 0; i < props.length - 1; i++) {
    let isNumber = false

    try {
      Number(props[0])
      isNumber = true
    } catch (e) {
      isNumber = false
    }

    let val = props[i] as string | number

    if (isNumber) {
      val = Number(val)
    }

    if (typeof result[props[i]] === 'undefined') result[props[i]] = {}
    result = result[props[i]]
  }

  return { result, finalProp: props[props.length - 1] }
}

export function useMutableState<S, I, E, R extends ReceptorMap, P extends string>(
  StateDefinition: StateDefinition<S, I, E, R>
): State<S, I & E & Identifiable>
export function useMutableState<S, I, E, R extends ReceptorMap, P extends string>(
  StateDefinition: StateDefinition<S, I, E, R>,
  path: Function.AutoPath<State<S, E>, P>
): _Object.Path<State<S, I & E & Identifiable>, String.Split<P, '.'>>
export function useMutableState<S, I, E, R extends ReceptorMap, P extends string>(
  StateDefinition: StateDefinition<S, I, E, R>,
  path?: Function.AutoPath<State<S, E>, P>
): _Object.Path<State<S, I & E & Identifiable>, String.Split<P, '.'>> {
  const rootState = getMutableState(StateDefinition)
  const resolvedState = path ? resolveObject(rootState, path as any) : rootState
  return useHookstate(resolvedState) as any
}

export const stateNamespaceKey = 'ir.hyperflux'

export interface SyncStateWithLocalAPI {}

/**
 * Automatically synchronises specific root paths of a hyperflux state definition with the localStorage.
 * Values get automatically populated if they exist in localStorage and saved when they are changed.
 * @param {string[]} keys the root paths to synchronise
 *
 * TODO: #7384 this api need to be revisited; we are syncing local state without doing any validation,
 * so if we ever change the acceptable values for a given state key, we will have to do a migration
 * or fallback to a default value, but we can't do that without knowing what the acceptable values are, which means
 * we need to pass in a schema or validator function to this function (we should use ts-pattern for this).
 */
export function syncStateWithLocalStorage<S, E extends Identifiable>(
  keys: string[]
): ExtensionFactory<S, E, SyncStateWithLocalAPI> {
  return () => {
    if (!isClient) return {}

    let rootState: State<S, E>

    return {
      onInit: (state) => {
        rootState = state
        for (const key of keys) {
          const storedValue = localStorage.getItem(`${stateNamespaceKey}.${state.identifier}.${key}`)
          if (storedValue !== null && storedValue !== 'undefined') state[key].set(JSON.parse(storedValue))
        }
      },
      onSet: (state, desc) => {
        for (const key of keys) {
          const storageKey = `${stateNamespaceKey}.${rootState.identifier}.${key}`
          const value = rootState[key]?.get(NO_PROXY)
          // We should still store flags that have been set to false or null
          if (value === undefined) localStorage.removeItem(storageKey)
          else localStorage.setItem(storageKey, JSON.stringify(value))
        }
      }
    } as any
  }
}
