/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { AlertService } from '@xrengine/client-core/src/common/services/AlertService'
import { client } from '@xrengine/client-core/src/feathers'
import { FeedAction } from '@xrengine/client-core/src/social/services/FeedActions'
import { useDispatch } from '@xrengine/client-core/src/store'

export const FeedBookmarkService = {
  addBookmarkToFeed: async (feedId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('feed-bookmark').create({ feedId })
        dispatch(FeedAction.addFeedBookmark(feedId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  removeBookmarkToFeed: async (feedId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('feed-bookmark').remove(feedId)
        dispatch(FeedAction.removeFeedBookmark(feedId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}
