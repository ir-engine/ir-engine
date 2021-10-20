/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */

import { CreatorShort } from '@standardcreative/common/src/interfaces/Creator'

export const FeedLikesAction = {
  feedLikesRetrieved: (feedLikes: CreatorShort[]) => {
    return {
      type: 'FEED_LIKES_RETRIEVED' as const,
      feedLikes: feedLikes
    }
  },
  fetchingFeedLikes: () => {
    return {
      type: 'FEED_LIKES_FETCH' as const
    }
  }
}

export type FeedLikesActionType = ReturnType<typeof FeedLikesAction[keyof typeof FeedLikesAction]>
