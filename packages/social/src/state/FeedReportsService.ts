/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { AlertService } from '@standardcreative/client-core/src/common/state/AlertService'
import { client } from '@standardcreative/client-core/src/feathers'
import { useDispatch } from '@standardcreative/client-core/src/store'
// import { fetchingFeedFires, feedFiresRetrieved } from './actions'
// import { addFeedReport } from '../feed/actions'

// export function getFeedReportsasync (feedId: string) {
//
// const dispatch = useDispatch(); {
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

export const FeedReportsService = {
  addReportToFeed: async (feedId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('feed-report').create({ feedId })
        // dispatch(addFeedReport(feedId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}

// export function removeReportToFeedasync (feedId: string) {
// const dispatch = useDispatch(); {
//     try {
//       await client.service('feed-report').remove(feedId)
//       dispatch(removeFeedReport(feedId))
//     } catch (err) {
//       console.log(err)
//       dispatchAlertError(dispatch, err.message)
//     }
//   }
// }
