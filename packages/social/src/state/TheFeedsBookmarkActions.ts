/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */

import { TheFeedsShort, TheFeeds } from '@xrengine/common/src/interfaces/Feeds'

export const TheFeedsBookmarkAction = {
  addTheFeedsBookmark: (thefeeds: TheFeeds) => {
    return {
      type: 'ADD_THEFEEDS_BOOKMARK' as const,
      thefeeds: thefeeds
    }
  },
  removeTheFeedsBookmark: (thefeedId: string) => {
    return {
      type: 'REMOVE_THEFEEDS_BOOKMARK' as const,
      thefeedId
    }
  }
}

export type TheFeedsBookmarkActionType = ReturnType<typeof TheFeedsBookmarkAction[keyof typeof TheFeedsBookmarkAction]>
