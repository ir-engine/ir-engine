import { Dispatch } from 'redux'
import { client } from '@xrengine/client-core/src/feathers'
import { FeedLikesAction } from './FeedLikesActions'
import { FeedAction } from '@xrengine/client-core/src/social/reducers/feed/FeedActions'
import { AlertService } from '@xrengine/client-core/src/common/reducers/alert/AlertService'

export const FeedLikesService = {
  getFeedLikes: (feedId: string) => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
        dispatch(FeedLikesAction.fetchingFeedLikes())
        const feedsResults = await client.service('feed-likes').find({ query: { feedId: feedId } })
        dispatch(FeedLikesAction.feedLikesRetrieved(feedsResults.data))
      } catch (err) {
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  addLikeToFeed: (feedId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        await client.service('feed-likes').create({ feedId })
        dispatch(FeedAction.addFeedLike(feedId))
      } catch (err) {
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  removeLikeToFeed: (feedId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        await client.service('feed-likes').remove(feedId)
        dispatch(FeedAction.removeFeedLike(feedId))
      } catch (err) {
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  }
}
