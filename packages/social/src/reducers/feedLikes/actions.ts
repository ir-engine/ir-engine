/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { FEED_LIKES_RETRIEVED, FEED_LIKES_FETCH } from '../actions'
import { CreatorShort } from '@xrengine/common/src/interfaces/Creator'

export interface FeedLikesRetriveAction {
  type: string
  feedLikes: CreatorShort[]
}

export interface FetchingFeedLikesAction {
  type: string
}

export type FeedLikesAction = FeedLikesRetriveAction | FetchingFeedLikesAction

export function feedLikesRetrieved(feedLikes: CreatorShort[]): FeedLikesRetriveAction {
  return {
    type: FEED_LIKES_RETRIEVED,
    feedLikes: feedLikes
  }
}

export function fetchingFeedLikes(): FetchingFeedLikesAction {
  return {
    type: FEED_LIKES_FETCH
  }
}
