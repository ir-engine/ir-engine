/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { Dispatch } from 'redux'
import { AlertService } from '@xrengine/client-core/src/common/reducers/alert/AlertService'
import { client } from '@xrengine/client-core/src/feathers'
import { fetchingFeedFires, feedFiresRetrieved } from './actions'
import { FeedAction } from '../feed/FeedActions'

export function getFeedFires(feedId: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(fetchingFeedFires())
      const feedsResults = await client.service('feed-fires').find({ query: { feedId: feedId } })
      dispatch(feedFiresRetrieved(feedsResults.data))
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function addFireToFeed(feedId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('feed-fires').create({ feedId })
      dispatch(FeedAction.addFeedFire(feedId))
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function removeFireToFeed(feedId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('feed-fires').remove(feedId)
      dispatch(FeedAction.removeFeedFire(feedId))
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}
