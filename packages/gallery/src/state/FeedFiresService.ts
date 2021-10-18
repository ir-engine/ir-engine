/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { AlertService } from '@xrengine/client-core/src/common/state/AlertService'
import { client } from '@xrengine/client-core/src/feathers'
import { FeedFiresAction } from './FeedFiresActions'
import { FeedAction } from '@xrengine/client-core/src/social/state/FeedActions'
import { useDispatch } from '@xrengine/client-core/src/store'

export const FeedFiresService = {
  getFeedFires: async (feedId: string) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(FeedFiresAction.fetchingFeedFires())
        const feedsResults = await client.service('feed-fires').find({ query: { feedId: feedId } })
        dispatch(FeedFiresAction.feedFiresRetrieved(feedsResults.data))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  addFireToFeed: async (feedId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('feed-fires').create({ feedId })
        dispatch(FeedAction.addFeedFire(feedId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  removeFireToFeed: async (feedId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('feed-fires').remove(feedId)
        dispatch(FeedAction.removeFeedFire(feedId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}
