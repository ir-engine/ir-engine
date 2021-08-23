import Immutable from 'immutable'

import {
  ADD_ARMEDIA,
  UPDATE_AR_MEDIA,
  ARMEDIA_ADMIN_RETRIEVED,
  REMOVE_ARMEDIA,
  ARMEDIA_FETCHING
} from '../../../actions'
import { AdminArMediaAction, AdminArMediaOneAction, AdminArMediaRetriveAction } from './actions'

export const ARMEDIA_SOCIAL_PAGE_LIMIT = 100

export const initialArMediaState = {
  arMedia: {
    arMedia: [],
    skip: 0,
    limit: ARMEDIA_SOCIAL_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  }
}

const immutableState = Immutable.fromJS(initialArMediaState) as any

const arMediaReducer = (state = immutableState, action: AdminArMediaAction): any => {
  let result: any, updateMap: any
  switch (action.type) {
    case ARMEDIA_FETCHING:
      return state.set('fetching', true)
    case ARMEDIA_ADMIN_RETRIEVED:
      result = (action as AdminArMediaRetriveAction).list
      updateMap = new Map(state.get('arMedia'))
      updateMap.set('arMedia', result.data)
      updateMap.set('skip', (result as any).skip)
      updateMap.set('limit', (result as any).limit)
      updateMap.set('retrieving', false)
      updateMap.set('fetched', true)
      updateMap.set('updateNeeded', false)
      updateMap.set('lastFetched', new Date())
      return state.set('arMedia', updateMap)
    case ADD_ARMEDIA:
      updateMap = new Map(state.get('arMedia'))
      updateMap.set('updateNeeded', true)
      return state.set('arMedia', updateMap)
    case REMOVE_ARMEDIA:
      const dataMap = new Map(state.get('arMedia'))
      dataMap.set('updateNeeded', true)
      return state.set('arMedia', dataMap)
    case UPDATE_AR_MEDIA:
      let update = new Map(state.get('arMedia'))
      update.set('updateNeeded', true)
      return state.set('arMedia', update)
  }

  return state
}

export default arMediaReducer
