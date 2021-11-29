/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { AlertService } from '@xrengine/client-core/src/common/services/AlertService'
import { client } from '@xrengine/client-core/src/feathers'
import { useDispatch } from '@xrengine/client-core/src/store'
import { TheFeedsBookmarkAction } from './TheFeedsBookmarkActions'

// thefeeds
// TheFeeds
// THEFEEDS

export const TheFeedsBookmarkService = {
  addBookmarkToTheFeeds: async (thefeedsId: string) => {
    const dispatch = useDispatch()
    {
      try {
        let thefeeds = await client.service('thefeeds-bookmark').create({ thefeedsId })
        dispatch(TheFeedsBookmarkAction.addTheFeedsBookmark(thefeeds))
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  },
  removeBookmarkToTheFeeds: async (thefeedsId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('thefeeds-bookmark').remove(thefeedsId)
        dispatch(TheFeedsBookmarkAction.removeTheFeedsBookmark(thefeedsId))
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  }
}
