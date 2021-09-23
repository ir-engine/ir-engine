/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { Dispatch } from 'redux'
import { AlertService } from '@xrengine/client-core/src/common/reducers/alert/AlertService'
import { client } from '@xrengine/client-core/src/feathers'
import { addTheFeedsFire, removeTheFeedsFire } from '../thefeeds/actions'

// thefeeds
// TheFeeds
// THEFEEDS

export function getTheFeedsFires(thefeedsId: string, setThefeedsFires: any) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      //       dispatch(fetchingTheFeedsFires());
      const thefeedsResults = await client.service('thefeeds-fires').find({ query: { thefeedsId: thefeedsId } })
      //       console.log(thefeedsResults)

      //       dispatch(thefeedsFiresRetrieved(thefeedsResults.data, thefeedsId));
      setThefeedsFires(thefeedsResults)
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function addFireToTheFeeds(thefeedsId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const feedsFire = await client.service('thefeeds-fires').create({ thefeedsId })
      const feedsFireStore = {
        id: feedsFire.creatorId
      }
      //@ts-ignore
      dispatch(addTheFeedsFire(feedsFireStore))
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function removeFireToTheFeeds(thefeedsId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('thefeeds-fires').remove(thefeedsId)
      dispatch(removeTheFeedsFire(thefeedsId))
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}
