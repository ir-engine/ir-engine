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
import { useCallback, useEffect, useMemo } from 'react'

import { ServiceTypes } from '@etherealengine/common/declarations'
import { NO_PROXY, State, defineState, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { OpaqueType } from '@etherealengine/common/src/interfaces/OpaqueType'
import { Engine } from '../../ecs/classes/Engine'

export type Methods = 'find' | 'get' | 'create' | 'update' | 'patch' | 'remove'

export type MethodArgs = {
  find: [Params, any?]
  get: [string, any?]
  create: [any, any?]
  update: [string, any, any?]
  patch: [string, any, any?]
  remove: [string, any?]
}

type QueryHash = OpaqueType<'QueryHash'> & string

type Paginated<T> = {
  data: T[]
  total: number
  limit: number
  skip: number
}

type ArrayOrPaginated<T> = T[] | Paginated<T>

type ArrayOrPaginatedType<T> = T extends ArrayOrPaginated<infer R> ? R[] : never

export const FeathersState = defineState({
  name: 'ee.engine.FeathersState',
  initial: () =>
    ({}) as Record<
      keyof ServiceTypes,
      Record<
        QueryHash,
        {
          fetch: () => void
          response: unknown
          status: 'pending' | 'success' | 'error'
          error: ''
        }
      >
    >
})

type Args = MethodArgs[Methods]

export const useQuery = <S extends keyof ServiceTypes, M extends Methods>(serviceName: S, method: M, ...args: Args) => {
  const service = Engine.instance.api.service(serviceName)
  const state = useHookstate(getMutableState(FeathersState))

  const queryId = `${method.substring(0, 1)}:${hashObject({
    serviceName,
    method,
    args
  })}` as QueryHash

  const fetch = () => {
    if (method === 'get' && !args[0]) return
    state[serviceName][queryId].merge({
      status: 'pending',
      error: ''
    })
    service[method](...args)
      .then((res) => {
        state[serviceName][queryId].merge({
          response: res,
          status: 'success',
          error: ''
        })
      })
      .catch((error) => {
        console.error(error)
        state[serviceName][queryId].merge({
          status: 'error',
          error: error.message
        })
      })
  }

  useRealtime(serviceName, fetch)

  useEffect(() => {
    if (method === 'get' && !args[0]) return
    if (!state.get(NO_PROXY)[serviceName]) state[serviceName].set({})
    if (!state.get(NO_PROXY)[serviceName][queryId]) {
      state[serviceName].merge({
        [queryId]: {
          fetch,
          response: null,
          status: 'pending',
          error: ''
        }
      })
      fetch()
    }
  }, [serviceName, method, ...args])

  const query = state[serviceName]?.[queryId]
  const queryObj = state.get(NO_PROXY)[serviceName]?.[queryId]
  const data = queryObj?.response as Awaited<ReturnType<ServiceTypes[S][M]>> | undefined
  const error = queryObj?.error
  const status = queryObj?.status

  return useMemo(
    () => ({
      data,
      status,
      error,
      refetch: fetch
    }),
    [data, query?.response, query?.status, query?.error]
  )
}

export const useGet = <S extends keyof ServiceTypes>(serviceName: S, id: string | undefined, params: Params = {}) => {
  return useQuery(serviceName, 'get', id, params)
}

export type PaginationQuery = Partial<PaginationProps> & Query

export const useFind = <S extends keyof ServiceTypes>(serviceName: S, params: Params<PaginationQuery> = {}) => {
  const paginate = usePaginate(params.query)

  const response = useQuery(serviceName, 'find', {
    ...params,
    query: {
      ...params.query,
      ...paginate.query
    }
  })

  const data = response?.data
    ? Array.isArray(response.data)
      ? response.data
      : response.data.data
      ? response.data.data
      : response.data
    : []
  const total: number = response?.data && !Array.isArray(response.data) ? response.data.total : 0

  return {
    ...response,
    total,
    setSort: paginate.setSort,
    setLimit: paginate.setLimit,
    setPage: paginate.setPage,
    page: paginate.page,
    skip: paginate.query.$skip,
    limit: paginate.query.$limit,
    sort: paginate.query.$sort,
    data: data as ArrayOrPaginatedType<(typeof response)['data']>
  }
}

const forceRefetch = (serviceName: keyof ServiceTypes) => {
  const feathersState = getState(FeathersState)
  if (!feathersState[serviceName]) return
  for (const queryId in feathersState[serviceName]) {
    feathersState[serviceName][queryId].fetch()
  }
}

const created = ({ serviceName, item }) => {
  forceRefetch(serviceName)
}

const updated = ({ serviceName, item }) => {
  forceRefetch(serviceName)
}

const removed = ({ serviceName, item }) => {
  forceRefetch(serviceName)
}

type CreateMethodParameters<S extends keyof ServiceTypes> = ServiceTypes[S]['create']
type UpdateMethodParameters<S extends keyof ServiceTypes> = ServiceTypes[S]['update']
type PatchMethodParameters<S extends keyof ServiceTypes> = ServiceTypes[S]['patch']
type RemoveMethodParameters<S extends keyof ServiceTypes> = ServiceTypes[S]['remove']

/**
 * Simple mutation hook exposing crud methods
 * of any feathers service. The resulting state
 * of calling these operations needs to be handled
 * by the caller. as you create/update/patch/remove
 * entities using this helper, the entities cache gets updated
 */
export function useMutation<S extends keyof ServiceTypes>(serviceName: S) {
  const state = useHookstate({
    status: 'idle',
    data: null as unknown | null,
    error: null as string | null
  })

  const create = useMethod('create', created, serviceName, state) as CreateMethodParameters<S>
  const update = useMethod('update', updated, serviceName, state) as UpdateMethodParameters<S>
  const patch = useMethod('patch', updated, serviceName, state) as PatchMethodParameters<S>
  const remove = useMethod('remove', removed, serviceName, state) as RemoveMethodParameters<S>

  const mutation = useMemo(
    () => ({
      create,
      update,
      patch,
      remove,
      data: state.data.value,
      status: state.status.value,
      error: state.value.error
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

/**
 * An internal hook that will listen to realtime updates to a service
 * and update the cache as changes happen.
 */
export function useRealtime(serviceName: keyof ServiceTypes, refetch: () => void) {
  useEffect(() => {
    const service = Engine.instance.api.service(serviceName)

    service.on('created', refetch)
    service.on('updated', refetch)
    service.on('patched', refetch)
    service.on('removed', refetch)

    return () => {
      service.off('created', refetch)
      service.off('updated', refetch)
      service.off('patched', refetch)
      service.off('removed', refetch)
    }
  }, [serviceName])
}

export type FeathersOrder = -1 | 0 | 1

type PaginationProps = {
  $skip: number
  $limit: number
  $sort: Record<string, FeathersOrder>
}

export function usePaginate(defaultProps = {} as Partial<PaginationProps>) {
  const store = useHookstate({
    $skip: defaultProps.$skip ?? 0,
    $limit: defaultProps.$limit ?? 10,
    $sort: defaultProps.$sort ?? {}
  } as PaginationProps)

  const query = store.get(NO_PROXY)

  const setSort = (sort: Record<string, FeathersOrder>) => {
    store.$sort.set(sort)
  }

  const setLimit = (limit: number) => {
    store.$limit.set(limit)
  }

  const setPage = (page: number) => {
    store.$skip.set(page * store.$limit.value)
  }

  return {
    query,
    page: Math.floor(store.$skip.value / store.$limit.value),
    setSort,
    setLimit,
    setPage
  }
}
