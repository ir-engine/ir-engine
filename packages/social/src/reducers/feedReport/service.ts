/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { dispatchAlertError } from '@xrengine/client-core/src/common/reducers/alert/AlertService'
import { client } from '@xrengine/client-core/src/feathers'
import { Dispatch } from 'redux'

// import { fetchingFeedFires, feedFiresRetrieved } from './actions'
// import { addFeedReport } from '../feed/actions'

// export function getFeedReports(feedId: string) {
//   return async (dispatch: Dispatch, getState: any): Promise<any> => {
//     try {
//       dispatch(fetchingFeedFires())
//       const feedsResults = await client.service('feed-report').find({ query: { feedId: feedId } })
//       dispatch(feedFiresRetrieved(feedsResults.data))
//     } catch (err) {
//       console.log(err)
//       dispatchAlertError(dispatch, err.message)
//     }
//   }
// }

export function addReportToFeed(feedId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('feed-report').create({ feedId })
      // dispatch(addFeedReport(feedId))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

// export function removeReportToFeed(feedId: string) {
//   return async (dispatch: Dispatch): Promise<any> => {
//     try {
//       await client.service('feed-report').remove(feedId)
//       dispatch(removeFeedReport(feedId))
//     } catch (err) {
//       console.log(err)
//       dispatchAlertError(dispatch, err.message)
//     }
//   }
// }
