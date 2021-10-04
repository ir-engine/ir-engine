import { createState, useState, none, Downgraded } from '@hookstate/core'
import { GroupActionType } from './GroupActions'

export const GROUP_PAGE_LIMIT = 10

export const state = createState({
  group: {
    group: [],
    skip: 0,
    limit: GROUP_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  },
  fetching: false
})

export const adminGroupReducer = (_, action: GroupActionType) => {
  Promise.resolve().then(() => groupReceptor(action))
  return state.attach(Downgraded).value
}

const groupReceptor = (action: GroupActionType): any => {
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
          lastFetched: new Date()
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
