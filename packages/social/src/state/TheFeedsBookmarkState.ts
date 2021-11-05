/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */

/**
 * Commenting code to compile TSDOC Docusaurus
 * this file contain some issues with
 * TheFeedsFiresAction, TheFeedsFiresRetriveAction imports are not available in actions.ts file its empty file.
 *
 */

// thefeeds
// TheFeeds
// THEFEEDS

import { TheFeedsBookmarkActionType } from './TheFeedsBookmarkActions'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { store } from '@xrengine/client-core/src/store'

const state = createState({
  thefeedsbookmark: {
    thefeeds: [],
    fetching: false
  }
})

store.receptors.push((action: TheFeedsBookmarkActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'ADD_THEFEEDS_BOOKMARK':
        return s.thefeedsbookmark.thefeeds.set([...s.thefeedsbookmark.thefeeds, action.thefeeds])
      case 'REMOVE_THEFEEDS_BOOKMARK':
        return s.thefeedsbookmark.thefeeds.set([
          ...s.thefeedsbookmark.thefeeds.value.filter((thefeeds) => thefeeds.id !== action.thefeedId)
        ])
    }
  }, action.type)
})

export const accessTheFeedsBookmarkState = () => state
export const useTheFeedsBookmarkState = () => useState(state)
