/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */

import { CreatorShort } from '@standardcreative/common/src/interfaces/Creator'

export const FeedFiresAction = {
  feedFiresRetrieved: (feedFires: CreatorShort[]) => {
    return {
      type: 'FEED_FIRES_RETRIEVED' as const,
      feedFires: feedFires
    }
  },
  fetchingFeedFires: () => {
    return {
      type: 'FEED_FIRES_FETCH' as const
    }
  }
}

export type FeedFiresActionType = ReturnType<typeof FeedFiresAction[keyof typeof FeedFiresAction]>
