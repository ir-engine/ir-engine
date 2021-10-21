import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { GroupActionType } from './GroupActions'
import { Group } from '@xrengine/common/src/interfaces/Group'

export const GROUP_PAGE_LIMIT = 10

export const state = createState({
  group: {
    group: [] as Array<Group>,
    skip: 0,
    limit: GROUP_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  },
  fetching: false
})

export const receptor = (action: GroupActionType): any => {
  let result: any
  state.batch((s) => {
    switch (action.type) {
      case 'GROUP_FETCHING':
        return s.merge({ fetching: true })
      case 'GROUP_ADMIN_RETRIEVED':
        result = action.list
        return s.group.merge({
          group: result.data,
          skip: result.skip,
          limit: result.limit,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: Date.now()
        })
      case 'ADD_GROUP':
        return s.group.merge({ updateNeeded: true })
      case 'GROUP_ADMIN_UPDATE':
        return s.group.merge({ updateNeeded: true })
      case 'GROUP_ADMIN_DELETE':
        return s.group.merge({ updateNeeded: true })
    }
  }, action.type)
}

export const accessGroupState = () => state

export const useGroupState = () => useState(state) as any as typeof state
