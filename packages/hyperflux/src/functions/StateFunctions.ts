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

export type ReceptorMap<S = any> = Record<string, ActionReceptor<any, S>>

export type StateDefinition<S, I, E, Receptors extends ReceptorMap<S>> = {
  name: string
  initial: SetInitialStateAction<S>
  extension?: ExtensionFactory<S, I, E>
  receptors?: Receptors
  receptorActionQueue?: ActionQueueHandle
  reactor?: any // why does React.FC break types?
  /** @deprecated use `extension` */
  onCreate?: (store: HyperStore, state: State<S, I & E>) => void
}

export const StateDefinitions = new Map<string, StateDefinition<any, any, any, ReceptorMap<any>>>()

export const setInitialState = (def: StateDefinition<any, any, any, ReceptorMap<any>>) => {
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

export function defineState<S, I, E, R extends ReceptorMap<S>, StateExtras = Record<string, any>>(
  definition: StateDefinition<S, I, E, R> & StateExtras
) {
  if (StateDefinitions.has(definition.name)) throw new Error(`State ${definition.name} already defined`)
  StateDefinitions.set(definition.name, definition)
  return definition as StateDefinition<S, I, E, R> & { _TYPE: S } & StateExtras
}

export function getMutableState<S, I, E, R extends ReceptorMap<S>>(StateDefinition: StateDefinition<S, I, E, R>) {
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

export function resolveObject<O extends object, P extends string | ReadonlyArray<string | number>>(
  obj: O,
  path: P
): _Object.Path<O, P extends string ? String.Split<P, '.'> : P> {
  const keyPath = Array.isArray(path) ? path : (path as string).split('.')
  return keyPath.reduce((prev, curr) => prev?.[curr], obj as any)
}

export function getNestedObject(object: any, propertyName: string) {
  if (propertyName === '') return { result: object, finalProp: '' }
  if (propertyName.startsWith('.')) propertyName = propertyName.slice(1)
  const props = propertyName.split('.')
  let result = object
  for (let i = 0; i < props.length; i++) {
    if (typeof result !== 'object') continue
    let isNumber = false
    try {
      isNumber = !isNaN(Number(props[i]))
    } catch (e) {
      isNumber = false
    }
    let val = props[i] as string | number
    if (isNumber) {
      val = Number(val)
    }
    result = result[val]
  }
  return { result, finalProp: props[props.length - 1] }
}

export function setNestedObject(object: object, propertyName: string, value: any) {
  if (propertyName === '') return { result: object, finalProp: '' }
  if (propertyName.startsWith('.')) propertyName = propertyName.slice(1)
  const props = propertyName.split('.')
  let last = object
  for (let i = 0; i < props.length - 1; i++) {
    if (typeof last !== 'object') continue
    let isNumber = false
    try {
      isNumber = !isNaN(Number(props[i]))
    } catch (e) {
      isNumber = false
    }
    let val = props[i] as string | number
    if (isNumber) {
      val = Number(val)
    }

    if (!last[val]) {
      if (isNumber) last[val] = []
      else last[val] = {}
    }

    last = last[val]
  }
  last[props[props.length - 1]] = value
}

/** @todo unused */
const _mergeStateValuesDeep = (target: State<any>, source: any) => {
  if (typeof source !== 'object') {
    target.set(source)
    return
  }
  for (const key in target) {
    if (typeof source[key] === 'object') {
      if (source[key] === null) {
        target[key].set(null)
        return
      }
      if (Array.isArray(source[key])) {
        target[key].set([...source[key]]) // clone array deeply rather than reference
        return
      }
      _mergeStateValuesDeep(target[key], source[key]) // recurse objects
    }
  }
}

export function useMutableState<S, I, E, R extends ReceptorMap<S>, P extends string>(
  StateDefinition: StateDefinition<S, I, E, R>
): State<S, I & E & Identifiable>
export function useMutableState<S, I, E, R extends ReceptorMap<S>, P extends string>(
  StateDefinition: StateDefinition<S, I, E, R>,
  path: Function.AutoPath<State<S, E>, P>
): _Object.Path<State<S, I & E & Identifiable>, String.Split<P, '.'>>
export function useMutableState<S, I, E, R extends ReceptorMap<S>, P extends string>(
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
