/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { Dispatch } from 'redux'
import { AlertService } from '../../../common/reducers/alert/AlertService'
import { client } from '../../../feathers'
import { FeedFiresAction } from './FeedFiresActions'
import { FeedAction } from '../feed/FeedActions'

export const FeedFiresService = {
  getFeedFires: (feedId: string) => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
        dispatch(FeedFiresAction.fetchingFeedFires())
        const feedsResults = await client.service('feed-fires').find({ query: { feedId: feedId } })
        dispatch(FeedFiresAction.feedFiresRetrieved(feedsResults.data))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  addFireToFeed: (feedId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        await client.service('feed-fires').create({ feedId })
        dispatch(FeedAction.addFeedFire(feedId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  removeFireToFeed: (feedId: string) => {
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
}
