/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import Immutable from 'immutable'

/**
 * Commenting code to compile TSDOC Docusaurus
 * this file contain some issues with
 * FeedFiresAction, FeedFiresRetrieveAction imports are not available in actions.ts file its empty file.
 *
 */

import {
  ARMEDIA_FETCHING,
  ARMEDIA_ADMIN_RETRIEVED,
  ARMEDIA_RETRIEVED,
  ADD_ARMEDIA,
  REMOVE_ARMEDIA,
  ARMEDIA_FETCHING_ITEM,
  ARMEDIA_RETRIEVED_ITEM,
  UPDATE_AR_MEDIA
} from '../actions'
import {
  ArMediaAction,
  ArMediaOneAction,
  ArMediaRetrievedItemAction,
  ArMediaRetriveAction,
  FetchingArMediaItemAction
} from './actions'

export const ARMEDIA_PAGE_LIMIT = 100

export const initialArMediaState = {
  arMedia: {
    arMedia: [],
    skip: 0,
    limit: ARMEDIA_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  },
  adminList: [],
  list: [],
  fetching: false,
  item: {},
  fetchingItem: false
}

const immutableState = Immutable.fromJS(initialArMediaState) as any

const arMediaReducer = (state = immutableState, action: ArMediaAction): any => {
  let result: any, updateMap: any
  switch (action.type) {
    case ARMEDIA_FETCHING:
      return state.set('fetching', true)
    case ARMEDIA_ADMIN_RETRIEVED:
      result = (action as ArMediaRetriveAction).list
      updateMap = new Map(state.get('arMedia'))
      updateMap.set('arMedia', result.data)
      updateMap.set('skip', (result as any).skip)
      updateMap.set('limit', (result as any).limit)
      updateMap.set('retrieving', false)
      updateMap.set('fetched', true)
      updateMap.set('updateNeeded', false)
      updateMap.set('lastFetched', new Date())
      return state.set('arMedia', updateMap)
    case ARMEDIA_RETRIEVED:
      return state.set('list', (action as ArMediaRetriveAction).list).set('fetching', false)
    case ADD_ARMEDIA:
      updateMap = new Map(state.get('arMedia'))
      updateMap.set('updateNeeded', true)
      return state.set('arMedia', updateMap)
    case REMOVE_ARMEDIA:
      const dataMap = new Map(state.get('arMedia'))
      dataMap.set('updateNeeded', true)
      return state.set('arMedia', dataMap)
    case ARMEDIA_FETCHING_ITEM:
      return state.set('fetchingItem', true)
    case ARMEDIA_RETRIEVED_ITEM:
      return state.set('item', (action as ArMediaRetrievedItemAction).item).set('fetchingItem', false)
    case UPDATE_AR_MEDIA:
      let update = new Map(state.get('arMedia'))
      update.set('updateNeeded', true)
      return state.set('arMedia', update)
  }

  return state
}

export default arMediaReducer
