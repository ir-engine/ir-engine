/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { ArMedia } from '@xrengine/common/src/interfaces/ArMedia'
/**
 * Commenting code to compile TSDOC Docusaurus
 * this file contain some issues with
 * FeedFiresAction, FeedFiresRetrieveAction imports are not available in actions.ts file its empty file.
 *
 */

import { ArMediaActionType } from './ArMediaActions'

export const ARMEDIA_PAGE_LIMIT = 100

const state = createState({
  arMedia: {
    arMedia: [] as Array<ArMedia>,
    skip: 0,
    limit: ARMEDIA_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  },
  adminList: [],
  list: [] as Array<ArMedia>,
  fetching: false,
  item: {} as ArMedia | {},
  fetchingItem: false
})

export const receptor = (action: ArMediaActionType): any => {
  state.batch((s) => {
    let result: any
    switch (action.type) {
      case 'ARMEDIA_FETCHING':
        return s.fetching.set(true)
      case 'ARMEDIA_ADMIN_RETRIEVED':
        result = action.list
        return s.arMedia.merge({
          arMedia: result.data,
          skip: result.skip,
          total: result.total,
          limit: result.limit,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: Date.now()
        })
      case 'ARMEDIA_RETRIEVED':
        return s.merge({ list: action.list, fetching: false })
      case 'ADD_ARMEDIA':
        return s.arMedia.updateNeeded.set(true)
      case 'REMOVE_ARMEDIA':
        return s.arMedia.updateNeeded.set(true)
      case 'ARMEDIA_FETCHING_ITEM':
        return s.fetchingItem.set(true)
      case 'ARMEDIA_RETRIEVED_ITEM':
        return s.merge({ item: action.item, fetchingItem: false })
      case 'UPDATE_AR_MEDIA':
        return s.arMedia.updateNeeded.set(true)
    }
  }, action.type)
}

export const accessArMediaState = () => state
export const useArMediaState = () => useState(state)
