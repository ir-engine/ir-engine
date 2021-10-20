/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */

import { FeedShort, Feed, FeedResult } from '@standardcreative/common/src/interfaces/Feed'

export const FeedAction = {
  feedsRetrieved: (feeds: Feed[]) => {
    return {
      type: 'FEEDS_RETRIEVED' as const,
      feeds: feeds
    }
  },
  feedsFeaturedRetrieved: (feeds: FeedShort[]) => {
    return {
      type: 'FEEDS_FEATURED_RETRIEVED' as const,
      feeds: feeds
    }
  },
  feedsCreatorRetrieved: (feeds: FeedShort[]) => {
    return {
      type: 'FEEDS_CREATOR_RETRIEVED' as const,
      feeds: feeds
    }
  },
  feedsBookmarkRetrieved: (feeds: FeedShort[]) => {
    return {
      type: 'FEEDS_BOOKMARK_RETRIEVED' as const,
      feeds: feeds
    }
  },
  feedsFiredRetrieved: (feeds: FeedShort[]) => {
    return {
      type: 'FEEDS_FIRED_RETRIEVED' as const,
      feeds: feeds
    }
  },
  feedsMyFeaturedRetrieved: (feeds: FeedShort[]) => {
    return {
      type: 'FEEDS_MY_FEATURED_RETRIEVED' as const,
      feeds: feeds
    }
  },
  feedRetrieved: (feed: Feed) => {
    return {
      type: 'FEED_RETRIEVED' as const,
      feed: feed
    }
  },
  fetchingFeeds: () => {
    return {
      type: 'FEEDS_FETCH' as const
    }
  },
  fetchingFeaturedFeeds: () => {
    return {
      type: 'FEATURED_FEEDS_FETCH' as const
    }
  },
  fetchingCreatorFeeds: () => {
    return {
      type: 'CREATOR_FEEDS_FETCH' as const
    }
  },
  fetchingBookmarkedFeeds: () => {
    return {
      type: 'BOOKMARK_FEEDS_FETCH' as const
    }
  },
  fetchingFiredFeeds: () => {
    return {
      type: 'FIRED_FEEDS_FETCH' as const
    }
  },
  fetchingMyFeaturedFeeds: () => {
    return {
      type: 'MY_FEATURED_FEEDS_FETCH' as const
    }
  },
  fetchingAdminFeeds: () => {
    return {
      type: 'ADMIN_FEEDS_FETCH' as const
    }
  },
  addFeedFire: (feedId: string) => {
    return {
      type: 'ADD_FEED_FIRES' as const,
      feedId: feedId
    }
  },
  feedAsFeatured: (feedId: string) => {
    return {
      type: 'ADD_FEED_FEATURED' as const,
      feedId: feedId
    }
  },
  feedNotFeatured: (feedId: string) => {
    return {
      type: 'REMOVE_FEED_FEATURED' as const,
      feedId: feedId
    }
  },
  removeFeedFire: (feedId: string) => {
    return {
      type: 'REMOVE_FEED_FIRES' as const,
      feedId
    }
  },
  addFeedBookmark: (feedId: string) => {
    return {
      type: 'ADD_FEED_BOOKMARK' as const,
      feedId: feedId
    }
  },
  removeFeedBookmark: (feedId: string) => {
    return {
      type: 'REMOVE_FEED_BOOKMARK' as const,
      feedId
    }
  },
  addFeedView: (feedId: string) => {
    return {
      type: 'ADD_FEED_VIEW' as const,
      feedId: feedId
    }
  },
  deleteFeed: (feedId: string) => {
    return {
      type: 'DELETE_FEED' as const,
      feedId: feedId
    }
  },
  addFeed: (feed: Feed) => {
    return {
      type: 'ADD_FEED' as const,
      feed: feed
    }
  },
  feedsAdminRetrieved: (feeds: FeedResult) => {
    return {
      type: 'FEEDS_AS_ADMIN_RETRIEVED' as const,
      feeds: feeds
    }
  },
  updateFeedInList: (feed: Feed) => {
    return {
      type: 'UPDATE_FEED' as const,
      feed
    }
  },
  reduxClearCreatorFeatured: () => {
    return {
      type: 'CLEAR_CREATOR_FEATURED' as const
    }
  },
  lastFeedVideoUrl: (filePath) => {
    return {
      type: 'LAST_FEED_VIDEO_URL' as const,
      filePath: filePath
    }
  },
  addFeedReport: (feedId: string) => {
    return {
      type: 'ADD_FEED_REPORT' as const,
      feedId: feedId
    }
  },
  addFeedLike: (feedId: string) => {
    return {
      type: 'ADD_FEED_LIKES' as const,
      feedId: feedId
    }
  },
  removeFeedLike: (feedId: string) => {
    return {
      type: 'REMOVE_FEED_LIKES' as const,
      feedId
    }
  }
}

export type FeedActionType = ReturnType<typeof FeedAction[keyof typeof FeedAction]>
