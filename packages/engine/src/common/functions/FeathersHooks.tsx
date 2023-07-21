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

/**
 * This is a modified version of figbird. https://humaans.github.io/figbird/
 * It now runs on hookstate instead of redux, and has been modified to work with
 */

/**
 * API:
 * useFind(serviceName, options) => { data, status, refetch, isFetching, error }
 * useGet(serviceName, id, options) => { data, status, refetch, isFetching, error }
 * useMutation(serviceName) => { create, update, patch, remove, status, data, error }
 */

import { Params, Query } from '@feathersjs/feathers'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import sift from 'sift'

import { ServiceTypes } from '@etherealengine/common/declarations'
import { defineState, getMutableState, getState, NO_PROXY, none, State, useHookstate } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'

export type Methods = 'find' | 'get' | 'create' | 'update' | 'patch' | 'remove'

export const FeathersState = defineState({
  name: 'ee.engine.figbird',
  initial: () => ({
    entities: {} as Record<keyof ServiceTypes, Record<string, any>>, // <serviceName, <id, item>>
    queries: {} as Record<keyof ServiceTypes, Record<string, any>>, // <serviceName, <queryId, query>>
    index: {} as Record<keyof ServiceTypes, Record<string, any>> // <serviceName, <id, index>>
  })
})

type FetchedArgs = {
  serviceName: keyof ServiceTypes
  data: Paginated<any>
  method: Methods
  params: Params
  queryId: string
  realtime: Realtime
  matcher?: (query: any) => (item: any) => boolean
}

type MethodArgs = {
  serviceName: keyof ServiceTypes
  item: any
}

function fetched({ serviceName, data, method, params, queryId, realtime, matcher }: FetchedArgs) {
  const { data: items, ...meta } = data
  const state = getState(FeathersState)
  const mutableState = getMutableState(FeathersState)
  const entities = realtime === 'merge' ? { ...state.entities[serviceName] } : {}
  const index = realtime === 'merge' ? { ...state.index[serviceName] } : {}
  for (const item of items) {
    const itemId = item.id
    entities[itemId] = item

    if (realtime === 'merge') {
      const itemIndex = { ...index[itemId] }
      itemIndex.queries = { ...itemIndex.queries, [queryId]: true }
      itemIndex.size = itemIndex.size ? itemIndex.size + 1 : 1
      index[itemId] = itemIndex
    }
  }

  if (realtime === 'merge') {
    // update entities
    mutableState.entities[serviceName].set(entities)
    mutableState.index[serviceName].set(index)
  }

  if (!state[serviceName]) {
    mutableState.queries[serviceName].set({})
  }

  // update queries
  mutableState.queries[serviceName].merge({
    [queryId]: {
      params,
      data: items.map((x) => x.id),
      meta,
      method,
      realtime,
      matcher,
      ...(realtime === 'merge' ? {} : { entities })
    }
  })
}

function created({ serviceName, item }: MethodArgs) {
  updateQuery({ serviceName, method: 'create', item })
}

// applies to both update and patch
function updated({ serviceName, item }: MethodArgs) {
  const itemId = item.id
  const state = getState(FeathersState)
  const mutableState = getMutableState(FeathersState)
  const currItem = state.entities[serviceName][itemId].get(NO_PROXY)

  // check to see if we should discard this update
  if (currItem) {
    const currUpdatedAt = currItem.updatedAt
    const nextUpdatedAt = item.updatedAt
    if (nextUpdatedAt && nextUpdatedAt < currUpdatedAt) {
      return
    }
  }

  if (currItem) {
    mutableState.entities[serviceName][itemId].set(item)
  } else {
    const index = { queries: {}, size: 0 }
    mutableState.entities[serviceName][itemId].set(item)
    mutableState.index[serviceName][itemId].set(index)
  }

  updateQuery({ serviceName, method: 'update', item })
}

function removed({ serviceName, item: itemOrItems }: MethodArgs) {
  const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems]
  const state = getState(FeathersState)
  const mutableState = getMutableState(FeathersState)

  const exists = items.some((item) => state.entities[serviceName][item.id])
  if (!exists) return

  // remove this item from all the queries that reference it
  updateQuery({ serviceName, method: 'remove', item: itemOrItems })

  // now remove it from entities
  const serviceEntities = mutableState.entities[serviceName]
  const removedIds = [] as string[]
  for (const item of items) {
    serviceEntities[item.id].set(none)
    removedIds.push(item.id)
  }
}

type UpdateQueryArgs = {
  serviceName: keyof ServiceTypes
  method: Methods
  item: any
}

function updateQuery({ serviceName, method, item }: UpdateQueryArgs) {
  const items = Array.isArray(item) ? item : [item]
  for (const item of items) {
    const itemId = item.id

    const state = getState(FeathersState)
    const mutableState = getMutableState(FeathersState)

    const queries = { ...state.queries[serviceName] }
    const index = { ...state.index[serviceName][itemId] }
    index.queries = { ...index.queries }
    index.size = index.size || 0

    let updateCount = 0

    forEachObj(queries, (query, queryId) => {
      let matches

      // do not update non realtime queries
      // those get updated/refetched in a different way
      if (query.realtime !== 'merge') {
        return
      }

      if (method === 'remove') {
        // optimisation, if method is remove, we want to immediately remove the object
        // from cache, which means we don't need to match using matcher
        matches = false
      } else if (!query.params.query || Object.keys(query.params.query).length === 0) {
        // another optimisation, if there is no query, the object matches
        matches = true
      } else {
        const matcher = query.matcher ? query.matcher(defaultMatcher) : defaultMatcher
        matches = matcher(query.params.query)(item)
      }

      if (index.queries[queryId]) {
        if (!matches) {
          updateCount++
          queries[queryId] = {
            ...query,
            meta: { ...query.meta, total: query.meta.total - 1 },
            data: query.data.filter((id) => id !== itemId)
          }
          delete index.queries[queryId]
          index.size -= 1
        }
      } else {
        // only add if query has fetched all of the data..
        // if it hasn't fetched all of the data then leave this
        // up to the consumer of the figbird to decide if data
        // should be refetched
        if (matches && query.data.length <= query.meta.total) {
          updateCount++
          // TODO - sort
          queries[queryId] = {
            ...query,
            meta: { ...query.meta, total: query.meta.total + 1 },
            data: query.data.concat(itemId)
          }
          index.queries[queryId] = true
          index.size += 1
        }
      }
    })

    if (updateCount > 0) {
      mutableState.queries[serviceName].set(queries)
      mutableState.index[serviceName][itemId].set(index)

      // in case of create, only ever add it to the cache if it's relevant for any of the
      // queries, otherwise, we might end up piling in newly created objects into cache
      // even if the app never uses them
      if (!state.entities[serviceName][itemId]) {
        mutableState.entities[serviceName][itemId].set(item)
      }

      // this item is no longer relevant to any query, garbage collect it
      if (index.size === 0) {
        mutableState.entities[serviceName][itemId].set(none)
        mutableState.index[serviceName][itemId].set(none)
      }
    }
  }
}

function cleanQuery(query, operators, filters) {
  if (Array.isArray(query)) {
    return query.map((value) => cleanQuery(value, operators, filters))
  } else if (isObject(query)) {
    const result = {}

    Object.keys(query).forEach((key) => {
      const value = query[key]
      if (key[0] === '$') {
        if (filters.includes(key)) {
          return
        }

        if (!operators.includes(key)) {
          throw new Error(`Invalid query parameter ${key}`, query)
        }
      }

      result[key] = cleanQuery(value, operators, filters)
    })

    return result
  }
  return query
}

export const FILTERS = ['$sort', '$limit', '$skip', '$select']
export const OPERATORS = ['$in', '$nin', '$lt', '$lte', '$gt', '$gte', '$ne', '$or']

type FilterQueryOptions = {
  filters?: string[]
  operators?: string[]
}

// Removes special filters from the `query` parameters
export default function filterQuery(query, options = {} as FilterQueryOptions) {
  if (!query) return query
  const { filters: additionalFilters = [], operators: additionalOperators = [] } = options
  return cleanQuery(query, OPERATORS.concat(additionalOperators), FILTERS.concat(additionalFilters))
}

export function getIn(obj, path) {
  for (const segment of path) {
    if (obj) {
      obj = obj[segment]
    }
  }
  return obj
}

export function setIn(obj, path, value) {
  obj = isObject(obj) ? { ...obj } : {}
  const res = obj

  for (let i = 0; i < path.length; i++) {
    const segment = path[i]
    if (i === path.length - 1) {
      obj[segment] = value
    } else {
      obj[segment] = isObject(obj[segment]) ? { ...obj[segment] } : {}
      obj = obj[segment]
    }
  }

  return res
}

export function unsetIn(obj, path) {
  obj = isObject(obj) ? { ...obj } : {}
  const res = obj

  for (let i = 0; i < path.length; i++) {
    const segment = path[i]
    if (i === path.length - 1) {
      delete obj[segment]
    } else {
      if (isObject(obj[segment])) {
        obj = obj[segment]
      } else {
        break
      }
    }
  }

  return res
}

export function isObject(obj) {
  return typeof obj === 'object' && obj !== null
}

export function matcher(query, options) {
  const filteredQuery = filterQuery(query, options)
  const sifter = sift(filteredQuery)
  return (item) => sifter(item)
}

const defaultMatcher = matcher

export function hashObject(obj) {
  let hash = 0
  const str = JSON.stringify(obj)

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }

  return hash
}

export function forEachObj(obj, fn) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      fn(obj[key], key, obj)
    }
  }
}

export function inflight(makeKey, fn) {
  const flying = {}

  return (...args) => {
    const key = makeKey(...args)

    if (flying[key]) {
      return flying[key].then(() => null)
    }

    const res = fn(...args)
    flying[key] = res
      .then((res) => {
        delete flying[key]
        return res
      })
      .catch((err) => {
        delete flying[key]
        throw err
      })

    return flying[key]
  }
}

type ResourceDescriptor = {
  serviceName: keyof ServiceTypes
  queryId: string
  method: Methods
  id?: string
  params: Params
  realtime: Realtime
  selectData: (data: any) => any
  transformResponse: (data: any) => any
  matcher?: (query: any) => (item: any) => boolean
}

export function useCache(resourceDescriptor: ResourceDescriptor) {
  const { serviceName, queryId, method, id, params, realtime, selectData, transformResponse, matcher } =
    resourceDescriptor

  // we'll use a cheeky ref to store the previous mapped data array
  // because if the underlying list of data didn't change we don't
  // want consumers of useFind to have to worry about changing reference
  const dataRef = useRef([])

  const queryState = useHookstate(getMutableState(FeathersState).queries[serviceName])
  const cachedData = useHookstate({ data: null } as { data: any })

  useEffect(() => {
    const query = queryState.get(NO_PROXY)?.[queryId]
    if (query) {
      let { data, meta } = query
      const entities = query.entities || getState(FeathersState).entities[serviceName]
      data = data.map((id) => entities[id])
      if (same(data, dataRef.current)) {
        data = dataRef.current
      } else {
        dataRef.current = data
      }
      data = selectData(data)
      cachedData.set({ ...meta, data })
    } else {
      cachedData.set({ data: null })
    }
  }, [serviceName, queryId, selectData, queryState])

  const onFetched = (data) =>
    fetched({
      serviceName,
      queryId,
      method,
      params,
      data: {
        ...transformResponse(data),
        ...(id ? { id } : {})
      },
      realtime,
      matcher
    })

  return {
    cachedData: cachedData.get(NO_PROXY),
    updateCache: onFetched
  }
}

function same(a, b) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

const findSelectData = (data) => data
const findTransformResponse = (data) => data

export interface UseFindParams<Q extends Query> extends BaseParams<Q> {
  allPages?: boolean
  parallel?: boolean
  matcher?: (query: any) => (item: any) => boolean
}

type UseFindReturnType<S extends keyof ServiceTypes> = {
  data: Awaited<ReturnType<ServiceTypes[S]['find']>> | null
  status: Status
  refetch: () => void

  isFetching: boolean
  error: any
}

type Paginated<T> = {
  data: T[]
  total: number
  limit: number
  skip: number
}

type ArrayOrPaginated<T> = T[] | Paginated<T>

type ArrayOrPaginatedType<T> = T extends ArrayOrPaginated<infer R> ? R[] : never

/**
 * Simple find hook exposing find method of any feathers service.
 *
 * @param serviceName
 * @param options
 * @returns {data, status, refetch, isFetching, error}
 */
export function useFind<S extends keyof ServiceTypes, Q extends Query>(
  serviceName: S,
  options = {} as UseFindParams<Q>
) {
  const response = useQuery<S>(serviceName, options, {
    method: 'find',
    selectData: findSelectData,
    transformResponse: findTransformResponse
  }) as UseFindReturnType<S>

  const data = response.data ? (Array.isArray(response.data) ? response.data : response.data.data) : []

  return {
    ...response,
    data: data as ArrayOrPaginatedType<(typeof response)['data']>
  }
}

const getSelectData = (data) => data[0]
const getTransformResponse = (data) => ({ data: [data] })

export interface GetFindParams<Q extends Query> extends BaseParams<Q> {
  selectData?: (data: any) => any
  transformResponse?: (data: any) => any
}

type UseGetReturnType<S extends keyof ServiceTypes> = {
  data: Awaited<ReturnType<ServiceTypes[S]['get']>> | null
  status: Status
  refetch: () => void

  isFetching: boolean
  error: any
}

/**
 * Simple get hook exposing get method of any feathers service.
 *
 * @param serviceName
 * @param id
 * @param options
 * @returns {data, status, refetch, isFetching, error}
 */
export function useGet<S extends keyof ServiceTypes, Q extends Query>(
  serviceName: S,
  id: string,
  options = {} as GetFindParams<Q>
): UseGetReturnType<S> {
  const response = useQuery<S>(serviceName, options, {
    method: 'get',
    id,
    selectData: getSelectData,
    transformResponse: getTransformResponse
  })

  return response as UseGetReturnType<S>
}

/**
 * Simple mutation hook exposing crud methods
 * of any feathers service. The resulting state
 * of calling these operations needs to be handled
 * by the caller. as you create/update/patch/remove
 * entities using this helper, the entities cache gets updated
 *
 * @param serviceName
 * @returns {create, update, patch, remove, status, data, error}
 */
export function useMutation(serviceName: keyof ServiceTypes) {
  const state = useHookstate({
    status: 'idle',
    data: null as unknown | null,
    error: null as string | null
  })

  const create = useMethod('create', created, serviceName, state)
  const update = useMethod('update', updated, serviceName, state)
  const patch = useMethod('patch', updated, serviceName, state)
  const remove = useMethod('remove', removed, serviceName, state)

  const mutation = useMemo(
    () => ({
      create,
      update,
      patch,
      remove,
      data: state.data.value,
      status: state.status.value,
      error: state.error.value
    }),
    [create, update, patch, remove, state]
  )

  return mutation
}

function useMethod(
  method: Methods,
  action: (props: { serviceName: keyof ServiceTypes; item: any }) => void,
  serviceName: keyof ServiceTypes,
  state: State<any>
) {
  return useCallback(
    (...args) => {
      const service = Engine.instance.api.service(serviceName)
      state.merge({ status: 'loading', loading: true, data: null, error: null })
      return service[method](...args)
        .then((item) => {
          action({ serviceName, item })
          state.merge({ status: 'success', loading: false, data: item })
          return item
        })
        .catch((err) => {
          state.merge({ status: 'error', loading: false, error: err })
          throw err
        })
    },
    [serviceName, method, action]
  )
}

const getInflight = inflight((service, id, params, options) => `${service.path}/${options.queryId}`, getter)
const findInflight = inflight((service, params, options) => `${service.path}/${options.queryId}`, finder)

const fetchPolicies = ['swr', 'cache-first', 'network-only']
const realtimeModes = ['merge', 'refetch', 'disabled']

export type Realtime = 'merge' | 'refetch' | 'disabled'
export type FetchPolicy = 'swr' | 'cache-first' | 'network-only'
export type Status = 'loading' | 'success' | 'error'
export type MutationStatus = Status | 'idle'

export interface BaseParams<Q extends Query> extends Params<Q> {
  skip?: boolean
  realtime?: boolean
  fetchPolicy?: FetchPolicy
}

export interface QueryHookOptions {
  method: 'get' | 'find'
  id?: string
  selectData: (data: any) => any
  transformResponse: (data: any) => any
}

/**
 * A generic abstraction of both get and find
 */
export function useQuery<S extends keyof ServiceTypes>(
  serviceName: S,
  options = {} as UseFindParams<any>,
  queryHookOptions = {} as QueryHookOptions
) {
  const { method, id, selectData, transformResponse } = queryHookOptions

  const feathers = Engine.instance.api
  const disposed = useRef(false)
  const isInitialMount = useRef(true)

  let { skip, allPages, parallel, realtime = 'merge', fetchPolicy = 'swr', matcher, ...params } = options

  realtime = realtime || 'disabled'
  if (realtime !== 'disabled' && realtime !== 'merge' && realtime !== 'refetch') {
    throw new Error(`Bad realtime option, must be one of ${[realtimeModes].join(', ')}`)
  }

  if (!fetchPolicies.includes(fetchPolicy)) {
    throw new Error(`Bad fetchPolicy option, must be one of ${[fetchPolicies].join(', ')}`)
  }

  const queryId = `${method.substring(0, 1)}:${hashObject({
    serviceName,
    method,
    id,
    params,
    realtime
  })}`

  let { cachedData, updateCache } = useCache({
    serviceName,
    queryId,
    method,
    id,
    params,
    realtime,
    selectData,
    transformResponse,
    matcher
  })

  let hasCachedData = !!cachedData.data
  const fetched = fetchPolicy === 'cache-first' && hasCachedData

  const state = useHookstate({
    reloading: false,
    fetched,
    fetchedCount: 0,
    refetchSeq: 0,
    error: null
  })

  if (fetchPolicy === 'network-only' && state.fetchedCount.value === 0) {
    cachedData = { data: null }
    hasCachedData = false
  }

  const handleRealtimeEvent = useCallback(
    (payload) => {
      if (disposed.current) return
      if (realtime !== 'refetch') return
      state.merge({ fetched: false, refetchSeq: state.refetchSeq.value + 1 })
    },
    [realtime, disposed]
  )

  useEffect(() => {
    return () => {
      disposed.current = true
    }
  }, [])

  useEffect(() => {
    let disposed = false

    if (state.fetched) return
    if (skip) return
    state.merge({ reloading: true, error: null })
    const service = feathers.service(serviceName)
    const result =
      method === 'get'
        ? getInflight(service, id, params, { queryId })
        : findInflight(service, params, { queryId, allPages, parallel })

    result
      .then((res) => {
        // no res means we've piggy backed on an in flight request
        if (res) {
          updateCache(res)
        }

        if (!disposed) {
          state.merge({ fetched: true, fetchedCount: state.fetchedCount.value + 1, reloading: false })
        }
      })
      .catch((err) => {
        if (!disposed) {
          state.merge({ reloading: false, fetched: true, fetchedCount: state.fetchedCount.value + 1, error: err })
        }
      })

    return () => {
      disposed = true
    }
  }, [serviceName, queryId, state.fetched, state.refetchSeq, skip, allPages, parallel])

  // If serviceName or queryId changed, we should refetch the data
  useEffect(() => {
    if (!isInitialMount.current) {
      if (state.fetched.value)
        state.merge({
          fetched: false,
          fetchedCount: 0
        })
    }
  }, [serviceName, queryId])

  // realtime hook will make sure we're listening to all of the
  // updates to this service
  useRealtime(serviceName, realtime, handleRealtimeEvent)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
    }
  }, [])

  // derive the loading/reloading state from other substates
  const loading = !skip && !hasCachedData && !state.error.value
  const reloading = loading || state.reloading.value

  const refetch = () => state.merge({ fetched: false, refetchSeq: state.refetchSeq.value + 1 })

  return useMemo(
    () => ({
      ...(skip ? { data: null } : cachedData),
      status: loading ? 'loading' : state.error.value ? 'error' : 'success',
      refetch,
      isFetching: reloading,
      error: state.error.value
    }),
    [skip, cachedData.data, loading, state.error, refetch, reloading, loading, reloading]
  )
}

function getter(service, id, params) {
  return service.get(id, params)
}

function finder(service, params, { queryId, allPages, parallel }) {
  if (!allPages) {
    return service.find(params)
  }

  return new Promise((resolve, reject) => {
    let skip = 0
    const result = {
      data: [],
      skip: 0,
      limit: undefined!,
      total: undefined!
    } as Paginated<any>

    fetchNext()

    function doFind(skip) {
      return service.find({
        ...params,
        query: {
          ...(params.query || {}),
          $skip: skip
        }
      })
    }

    function resolveOrFetchNext(res) {
      if (res.data.length === 0 || result.data.length >= result.total) {
        resolve(result)
      } else {
        skip = result.data.length
        fetchNext()
      }
    }

    function fetchNextParallel() {
      const requiredFetches = Math.ceil((result.total - result.data.length) / result.limit)

      if (requiredFetches > 0) {
        Promise.all(new Array(requiredFetches).fill(undefined).map((_, idx) => doFind(skip + idx * result.limit)))
          .then((results) => {
            const [lastResult] = results.slice(-1)
            result.limit = lastResult.limit
            result.total = lastResult.total
            result.data = result.data.concat(results.flatMap((r) => r.data))

            resolveOrFetchNext(lastResult)
          })
          .catch(reject)
      } else {
        resolve(result)
      }
    }

    function fetchNext() {
      if (typeof result.total !== 'undefined' && typeof result.limit !== 'undefined' && parallel === true) {
        fetchNextParallel()
      } else {
        doFind(skip)
          .then((res) => {
            result.limit = res.limit
            result.total = res.total
            result.data = result.data.concat(res.data)

            resolveOrFetchNext(res)
          })
          .catch(reject)
      }
    }
  })
}

const refs = {} as Record<keyof ServiceTypes, Record<string, any>> // <serviceName, <id, refCount>>

/**
 * An internal hook that will listen to realtime updates to a service
 * and update the cache as changes happen.
 */
export function useRealtime(serviceName: keyof ServiceTypes, mode, cb) {
  useEffect(() => {
    // realtime is turned off
    if (mode === 'disabled') return

    // get the ref store of this service
    refs[serviceName] = refs[serviceName] || {}
    refs[serviceName].realtime = refs[serviceName].realtime || 0
    refs[serviceName].callbacks = refs[serviceName].callbacks || []
    const ref = refs[serviceName]

    if (mode === 'refetch' && cb) {
      refs[serviceName].callbacks.push(cb)
    }

    // get the service itself
    const service = Engine.instance.api.service(serviceName)

    // increment the listener counter
    ref.realtime += 1

    // bind to the realtime events, but only once globally per service
    if (ref.realtime === 1) {
      ref.created = (item) => {
        created({ serviceName, item })
        refs[serviceName].callbacks.forEach((c) => c({ event: 'created', serviceName, item }))
      }
      ref.updated = (item) => {
        updated({ serviceName, item })
        refs[serviceName].callbacks.forEach((c) => c({ event: 'updated', serviceName, item }))
      }
      ref.patched = (item) => {
        updated({ serviceName, item })
        refs[serviceName].callbacks.forEach((c) => c({ event: 'patched', serviceName, item }))
      }
      ref.removed = (item) => {
        removed({ serviceName, item })
        refs[serviceName].callbacks.forEach((c) => c({ event: 'removed', serviceName, item }))
      }

      service.on('created', ref.created)
      service.on('updated', ref.updated)
      service.on('patched', ref.patched)
      service.on('removed', ref.removed)
    }

    return () => {
      // decrement the listener counter
      ref.realtime -= 1
      refs[serviceName].callbacks = refs[serviceName].callbacks.filter((c) => c !== cb)

      // unbind from the realtime events if nothing is listening anymore
      if (ref.realtime === 0) {
        service.off('created', ref.created)
        service.off('updated', ref.updated)
        service.off('patched', ref.patched)
        service.off('removed', ref.removed)
      }
    }
  }, [serviceName, mode, cb])
}
