import { createState, useState } from '@hookstate/core'

import { StaticResource } from '@xrengine/common/src/interfaces/StaticResource'
import { StaticResourceResult } from '@xrengine/common/src/interfaces/StaticResourceResult'

import { client } from '../../feathers'
import { store, useDispatch } from '../../store'

//State
export const USER_PAGE_LIMIT = 100

const state = createState({
  skip: 0,
  limit: USER_PAGE_LIMIT,
  total: 0,
  retrieving: false,
  fetched: false,
  updateNeeded: true,
  lastFetched: Date.now(),
  staticResource: [] as Array<StaticResource>
})

store.receptors.push((action: UserActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'STATIC_RESOURCE_RETRIEVED':
        return s.merge({
          staticResource: action.staticResource.data,
          retrieving: false,
          updateNeeded: false,
          fetched: true
        })
    }
  }, action.type)
})

export const accessStaticResourceState = () => state

export const useStaticResourceState = () => useState(state) as any as typeof state

//Service
export const staticResourceService = {
  fetchStaticResource: async () => {
    const dispatch = useDispatch()
    {
      try {
        const result = await client.service('static-resource').find({
          query: {
            staticResourceType: 'avatar'
          }
        })
        dispatch(StaticResourceAction.fetchedStaticResource(result))
      } catch (error) {
        console.error(error)
      }
    }
  },
  refetchSingleUserAdmin: async () => {}
}

//Action
export const StaticResourceAction = {
  fetchedStaticResource: (data: StaticResourceResult) => {
    return {
      type: 'STATIC_RESOURCE_RETRIEVED' as const,
      staticResource: data
    }
  }
}

export type UserActionType = ReturnType<typeof StaticResourceAction[keyof typeof StaticResourceAction]>
