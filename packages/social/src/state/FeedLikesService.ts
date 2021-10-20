import { client } from '@standardcreative/client-core/src/feathers'
import { FeedLikesAction } from './FeedLikesActions'
import { FeedAction } from '@standardcreative/client-core/src/social/state/FeedActions'
import { AlertService } from '@standardcreative/client-core/src/common/state/AlertService'
import { useDispatch } from '@standardcreative/client-core/src/store'

export const FeedLikesService = {
  getFeedLikes: async (feedId: string) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(FeedLikesAction.fetchingFeedLikes())
        const feedsResults = await client.service('feed-likes').find({ query: { feedId: feedId } })
        dispatch(FeedLikesAction.feedLikesRetrieved(feedsResults.data))
      } catch (err) {
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  addLikeToFeed: async (feedId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('feed-likes').create({ feedId })
        dispatch(FeedAction.addFeedLike(feedId))
      } catch (err) {
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  removeLikeToFeed: async (feedId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('feed-likes').remove(feedId)
        dispatch(FeedAction.removeFeedLike(feedId))
      } catch (err) {
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}
