/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */

import { TheFeedsShort, TheFeeds } from '@xrengine/common/src/interfaces/Feeds'

// const thefeeds = '';
// conts TheFeeds = '';
// const THEFEEDS = '';

export const THEFEEDS_RETRIEVED = 'THEFEEDS_RETRIEVED'
export const THEFEEDS_FETCH = 'THEFEEDS_FETCH'
export const ADD_THEFEEDS = 'ADD_THEFEEDS'
export const REMOVE_THEFEEDS = 'REMOVE_THEFEEDS'
export const UPDATE_THEFEEDS = 'UPDATE_THEFEEDS'
export const ADD_THEFEEDS_FIRES = 'ADD_THEFEEDS_FIRES'
export const REMOVE_THEFEEDS_FIRES = 'REMOVE_THEFEEDS_FIRES'
export const ADD_THEFEEDS_BOOKMARK = 'ADD_THEFEEDS_BOOKMARK'
export const REMOVE_THEFEEDS_BOOKMARK = 'REMOVE_THEFEEDS_BOOKMARK'
export interface AllTheFeedsRetrievedAction {
  type: string
  thefeeds: TheFeedsShort[]
}

export interface TheFeedsRetrievedAction {
  type: string
  thefeeds: TheFeeds
}

export interface FetchingTheFeedsAction {
  type: string
}

export interface oneTheFeedsAction {
  type: string
  thefeeds: string
}

export type TheFeedsAction =
  | TheFeedsRetrievedAction
  | TheFeedsRetrievedAction
  | FetchingTheFeedsAction
  | oneTheFeedsAction

export function thefeedsRetrieved(thefeeds: TheFeeds[]): AllTheFeedsRetrievedAction {
  // console.log('actions',thefeeds)
  return {
    type: THEFEEDS_RETRIEVED,
    thefeeds: thefeeds
  }
}

export function fetchingTheFeeds(): FetchingTheFeedsAction {
  return {
    type: THEFEEDS_FETCH
  }
}

export function deleteTheFeeds(thefeedsId: string): oneTheFeedsAction {
  return {
    type: REMOVE_THEFEEDS,
    thefeeds: thefeedsId
  }
}

export function addTheFeeds(thefeeds: TheFeeds): TheFeedsRetrievedAction {
  return {
    type: ADD_THEFEEDS,
    thefeeds: thefeeds
  }
}

export function updateTheFeedsInList(thefeeds: TheFeeds): TheFeedsRetrievedAction {
  return {
    type: UPDATE_THEFEEDS,
    thefeeds: thefeeds
  }
}

export function addTheFeedsFire(thefeeds: string): oneTheFeedsAction {
  return {
    type: ADD_THEFEEDS_FIRES,
    thefeeds: thefeeds
  }
}

export function removeTheFeedsFire(thefeeds: string): oneTheFeedsAction {
  return {
    type: REMOVE_THEFEEDS_FIRES,
    thefeeds: thefeeds
  }
}

//The code is not in use START
export function addTheFeedsBookmark(thefeeds: string): oneTheFeedsAction {
  return {
    type: ADD_THEFEEDS_BOOKMARK,
    thefeeds: thefeeds
  }
}
export function removeTheFeedsBookmark(thefeeds: string): oneTheFeedsAction {
  return {
    type: REMOVE_THEFEEDS_BOOKMARK,
    thefeeds
  }
}
//The code below is not in use END
