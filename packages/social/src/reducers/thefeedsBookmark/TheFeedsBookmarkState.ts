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
import { createState, useState, none, Downgraded } from '@hookstate/core'

const state = createState({
  thefeedsbookmark: {
    thefeeds: [],
    fetching: false
  }
})

export const theFeedsBookmarkReducer = (_, action: TheFeedsBookmarkActionType) => {
  Promise.resolve().then(() => theFeedsBookmarkReceptor(action))
  return state.attach(Downgraded).value
}

const theFeedsBookmarkReceptor = (action: TheFeedsBookmarkActionType): any => {
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
}

export const accessTheFeedsBookmarkState = () => state
export const useTheFeedsBookmarkState = () => useState(state)
