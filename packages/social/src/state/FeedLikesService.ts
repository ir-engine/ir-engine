import { client } from '@xrengine/client-core/src/feathers'
import { FeedLikesAction } from './FeedLikesActions'
import { FeedAction } from '@xrengine/client-core/src/social/services/FeedService'
import { AlertService } from '@xrengine/client-core/src/common/services/AlertService'
import { useDispatch } from '@xrengine/client-core/src/store'

export const FeedLikesService = {
  getFeedLikes: async (feedId: string) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(FeedLikesAction.fetchingFeedLikes())
        const feedsResults = await client.service('feed-likes').find({ query: { feedId: feedId } })
        dispatch(FeedLikesAction.feedLikesRetrieved(feedsResults.data))
      } catch (err) {
        AlertService.dispatchAlertError(err)
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
        AlertService.dispatchAlertError(err)
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
        AlertService.dispatchAlertError(err)
      }
    }
  }
}
