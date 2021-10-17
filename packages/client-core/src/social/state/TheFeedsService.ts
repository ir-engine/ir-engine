/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */

import { AlertService } from '../../common/state/AlertService'
import { client } from '../../feathers'
import { useDispatch } from '../../store'
import { upload } from '../../util/upload'
import { TheFeedsAction } from './TheFeedsActions'

export const TheFeedsService = {
  getTheFeedsNew: async () => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(TheFeedsAction.fetchingTheFeeds())
        const thefeeds = await client.service('thefeeds').find()
        dispatch(TheFeedsAction.thefeedsRetrieved(thefeeds.data))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  createTheFeedsNew: async (data) => {
    const dispatch = useDispatch()
    {
      try {
        const storedVideo = await upload(data.video, null)
        console.log('storedVideo', storedVideo)
        const thefeeds = await client.service('thefeeds').create({
          title: data.title,
          videoId: (storedVideo as any).file_id,
          description: data.description
        })
        dispatch(TheFeedsAction.addTheFeeds(thefeeds))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  updateTheFeedsAsAdmin: async (data: any) => {
    const dispatch = useDispatch()
    {
      try {
        let thefeeds = { id: data.id, title: data.title, videoId: data.video, description: data.description }
        if (typeof data.video === 'object') {
          const storedVideo = await upload(data.video, null)
          thefeeds['videoId'] = (storedVideo as any).file_id
        }
        const updatedItem = await client.service('thefeeds').patch(thefeeds.id, thefeeds)
        dispatch(TheFeedsAction.updateTheFeedsInList(updatedItem))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  removeTheFeeds: async (thefeedsId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('thefeeds').remove(thefeedsId)
        dispatch(TheFeedsAction.deleteTheFeeds(thefeedsId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}
