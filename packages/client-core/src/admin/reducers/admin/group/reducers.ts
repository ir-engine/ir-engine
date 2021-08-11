import Immutable from 'immutable'
import { update } from 'lodash'

import { GROUP_FETCHING, GROUP_ADMIN_RETRIEVED, ADD_GROUP } from '../../actions'

import { GroupAction, GroupRetrieveAction } from './actions'

export const PAGE_LIMIT = 100

export const initialGroupState = {
  group: {
    group: [],
    skip: 0,
    limit: PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  }
}

const immutableState = Immutable.fromJS(initialGroupState)

const groupReducer = (state = immutableState, action: GroupAction): any => {
  let result: any, updateMap: any
  switch (action.type) {
    case GROUP_FETCHING:
      return state.set('fetching', true)
    case GROUP_ADMIN_RETRIEVED:
      result = (action as GroupRetrieveAction).list
      updateMap = new Map(state.get('group'))
      updateMap.set('group', result.data)
      updateMap.set('skip', (result as any).skip)
      updateMap.set('limit', (result as any).limit)
      updateMap.set('retrieving', false)
      updateMap.set('fetched', true)
      updateMap.set('updateNeeded', false)
      updateMap.set('lastFetched', new Date())
      return state.set('group', updateMap)
    case ADD_GROUP:
      updateMap = new Map(state.get('group'))
      updateMap.set('updateNeeded', true)
      return state.set('group', updateMap)
  }
  return state
}

export default groupReducer
