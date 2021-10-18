/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { Dispatch } from 'redux'
import { AlertService } from '@xrengine/client-core/src/common/reducers/alert/AlertService'
import { client } from '@xrengine/client-core/src/feathers'
import { FeedAction } from '@xrengine/client-core/src/social/reducers/feed/FeedActions'

export const FeedBookmarkService = {
  addBookmarkToFeed: (feedId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        await client.service('feed-bookmark').create({ feedId })
        dispatch(FeedAction.addFeedBookmark(feedId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  removeBookmarkToFeed: (feedId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        await client.service('feed-bookmark').remove(feedId)
        dispatch(FeedAction.removeFeedBookmark(feedId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  }
}
