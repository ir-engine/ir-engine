/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { Dispatch } from 'redux'
import { AlertService } from '@xrengine/client-core/src/common/reducers/alert/AlertService'
import { client } from '@xrengine/client-core/src/feathers'
import { addTheFeedsBookmark, removeTheFeedsBookmark } from '../thefeeds/actions'

// thefeeds
// TheFeeds
// THEFEEDS

export function addBookmarkToTheFeeds(thefeedsId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('thefeeds-bookmark').create({ thefeedsId })
      dispatch(addTheFeedsBookmark(thefeedsId))
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function removeBookmarkToTheFeeds(thefeedsId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('thefeeds-bookmark').remove(thefeedsId)
      dispatch(removeTheFeedsBookmark(thefeedsId))
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}
