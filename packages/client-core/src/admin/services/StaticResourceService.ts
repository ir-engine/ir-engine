import { StaticResource } from '@xrengine/common/src/interfaces/StaticResource'
import { StaticResourceResult } from '@xrengine/common/src/interfaces/StaticResourceResult'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'

//State
export const USER_PAGE_LIMIT = 100

const AdminStaticResourceState = defineState({
  name: 'AdminStaticResourceState',
  initial: () => ({
    skip: 0,
    limit: USER_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now(),
    staticResource: [] as Array<StaticResource>
  })
})

const fetchedStaticResourceReceptor = (
  action: typeof AdminStaticResourceActions.fetchedStaticResource.matches._TYPE
) => {
  const state = getState(AdminStaticResourceState)
  return state.merge({
    staticResource: action.staticResource.data,
    retrieving: false,
    updateNeeded: false,
    fetched: true
  })
}

export const AdminStaticResourceReceptors = {
  fetchedStaticResourceReceptor
}

export const accessStaticResourceState = () => getState(AdminStaticResourceState)

export const useStaticResourceState = () => useState(accessStaticResourceState())

//Service
export const AdminStaticResourceService = {
  fetchStaticResource: async () => {
    try {
      const staticResource = await API.instance.client.service('static-resource').find({
        query: {
          staticResourceType: 'avatar'
        }
      })
      dispatchAction(AdminStaticResourceActions.fetchedStaticResource({ staticResource }))
    } catch (error) {
      console.error(error)
    }
  }
}

//Action
export class AdminStaticResourceActions {
  static fetchedStaticResource = defineAction({
    type: 'STATIC_RESOURCE_RETRIEVED' as const,
    staticResource: matches.object as Validator<unknown, StaticResourceResult>
  })
}
