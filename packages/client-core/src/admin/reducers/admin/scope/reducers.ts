import Immutable from 'immutable'

import { ScopeAction, ScopeRetrieveAction } from './actions'

export const PAGE_LIMIT = 100

import { ADD_SCOPE, SCOPE_FETCHING, SCOPE_ADMIN_RETRIEVED } from '../../actions'

export const initialScopeState = {
  scope: {
    scope: [],
    skip: 0,
    limit: PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  }
}

const immutableState = Immutable.fromJS(initialScopeState)

const scopeReducer = (state = immutableState, action: ScopeAction): any => {
  let result: any, updateMap: any

  switch (action.type) {
    case SCOPE_FETCHING:
      return state.set('fetching', true)
    case SCOPE_ADMIN_RETRIEVED:
      result = (action as ScopeRetrieveAction).list
      updateMap = new Map(state.get('scope'))
      updateMap.set('scope', result.data)
      updateMap.set('skip', (result as any).skip)
      updateMap.set('limit', (result as any).limit)
      updateMap.set('retrieving', false)
      updateMap.set('fetched', true)
      updateMap.set('updateNeeded', false)
      updateMap.set('lastFetched', new Date())
      return state.set('scope', updateMap)
    case ADD_SCOPE:
      updateMap = new Map(state.get('scope'))
      updateMap.set('updateNeeded', true)
      return state.set('scope', updateMap)
  }

  return state
}

export default scopeReducer
