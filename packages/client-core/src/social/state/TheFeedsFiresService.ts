/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { store, useDispatch } from '../../store'
import { AlertService } from '@xrengine/client-core/src/common/state/AlertService'
import { client } from '@xrengine/client-core/src/feathers'
import { TheFeedsAction } from './TheFeedsActions'

// thefeeds
// TheFeeds
// THEFEEDS

export const TheFeedsFiresService = {
  getTheFeedsFires: async (thefeedsId: string, setThefeedsFires: any) => {
    const dispatch = useDispatch()
    {
      try {
        //       dispatch(fetchingTheFeedsFires());
        const thefeedsResults = await client.service('thefeeds-fires').find({ query: { thefeedsId: thefeedsId } })
        //       console.log(thefeedsResults)

        //       dispatch(thefeedsFiresRetrieved(thefeedsResults.data, thefeedsId));
        setThefeedsFires(thefeedsResults)
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  addFireToTheFeeds: async (thefeedsId: string) => {
    const dispatch = useDispatch()
    {
      try {
        const feedsFire = await client.service('thefeeds-fires').create({ thefeedsId })
        const feedsFireStore = {
          id: feedsFire.creatorId
        }
        //@ts-ignore
        dispatch(addTheFeedsFire(feedsFireStore))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  removeFireToTheFeeds: async (thefeedsId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('thefeeds-fires').remove(thefeedsId)
        dispatch(TheFeedsAction.removeTheFeedsFire(thefeedsId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}
