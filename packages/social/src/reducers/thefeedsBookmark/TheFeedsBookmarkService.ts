import { TheFeedsBookmark } from '../../../../server-core/src/socialmedia/feeds-bookmark/feeds-bookmark.class'
/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { Dispatch } from 'redux'
import { AlertService } from '@xrengine/client-core/src/common/reducers/alert/AlertService'
import { client } from '@xrengine/client-core/src/feathers'
import { TheFeedsBookmarkAction } from './TheFeedsBookmarkActions'

// thefeeds
// TheFeeds
// THEFEEDS

export const TheFeedsBookmarkService = {
  addBookmarkToTheFeeds: (thefeedsId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        let thefeeds = await client.service('thefeeds-bookmark').create({ thefeedsId })
        dispatch(TheFeedsBookmarkAction.addTheFeedsBookmark(thefeeds))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  removeBookmarkToTheFeeds: (thefeedsId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        await client.service('thefeeds-bookmark').remove(thefeedsId)
        dispatch(TheFeedsBookmarkAction.removeTheFeedsBookmark(thefeedsId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  }
}
