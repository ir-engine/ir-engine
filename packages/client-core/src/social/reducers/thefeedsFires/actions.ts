/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { THEFEEDS_FIRES_RETRIEVED, THEFEEDS_FIRES_FETCH } from '../actions'
import { CreatorShort } from '@xrengine/common/src/interfaces/Creator'

// thefeeds
// TheFeeds
// THEFEEDS

export interface TheFeedsFiresRetriveAction {
  type: string
  thefeedsFires: CreatorShort[]
}

export interface FetchingTheFeedsFiresAction {
  type: string
}

export type TheFeedsFiresAction = TheFeedsFiresRetriveAction | FetchingTheFeedsFiresAction

export function thefeedsFiresRetrieved(thefeedsFires: CreatorShort[], thefeedsId): TheFeedsFiresRetriveAction {
  return {
    type: THEFEEDS_FIRES_RETRIEVED,
    thefeedsFires: thefeedsFires
  }
}

export function fetchingTheFeedsFires(): FetchingTheFeedsFiresAction {
  return {
    type: THEFEEDS_FIRES_FETCH
  }
}
