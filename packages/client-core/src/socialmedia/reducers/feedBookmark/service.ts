/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { Dispatch } from 'redux'
import { dispatchAlertError } from '../../../common/reducers/alert/service'
import { client } from '../../../feathers'
import { addFeedBookmark, removeFeedBookmark } from '../feed/actions'

export function addBookmarkToFeed(feedId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('feed-bookmark').create({ feedId })
      dispatch(addFeedBookmark(feedId))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function removeBookmarkToFeed(feedId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('feed-bookmark').remove(feedId)
      dispatch(removeFeedBookmark(feedId))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}
