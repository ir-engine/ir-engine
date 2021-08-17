import { Dispatch } from 'redux'
import { dispatchAlertError } from '../../../../../common/reducers/alert/service'
import { client } from '../../../../../feathers'
import { fetchingAdminFeeds, feedsAdminRetrieved, addFeed, removeFeed, editFeed } from './actions'
import Api from '../../../../../world/components/editor/Api'

export const getAdminFeeds =
  () =>
  async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      const user = getState().get('auth').get('user')
      // dispatch(fetchingAdminFeeds())
      if (user.userRole === 'admin') {
        const feedsResults = await client.service('feed').find({
          query: {
            action: 'admin'
          }
        })
        dispatch(feedsAdminRetrieved(feedsResults))
      }
    } catch (err) {
      console.error(err)
      dispatchAlertError(dispatch, err.message)
    }
  }

export function createFeed({ title, description, video, preview }: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      // dispatch(fetchingFeeds())
      const api = new Api()
      const storedVideo = await api.upload(video, null)
      const storedPreview = await api.upload(preview, null)

      //@ts-ignore error that this vars are void bacause upload is defines as voin funtion
      if (storedVideo && storedPreview) {
        //@ts-ignore error that this vars are void bacause upload is defines as voin funtion
        const feed = await client.service('feed').create({
          title,
          description,
          videoId: storedVideo.file_id,
          previewId: storedPreview.file_id
        })
        dispatch(addFeed(feed))
        //@ts-ignore
        const mediaLinks = { video: storedVideo.origin, preview: storedPreview.origin }
        return mediaLinks
      }
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function updateFeed(feedId, files, feedItem) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      // dispatch(fetchingFeeds())
      const api = new Api()
      const storedPreview = files.preview instanceof File ? await api.upload(files.preview, null) : null
      const storedVideo = files.video instanceof File ? await api.upload(files.video, null) : null

      //@ts-ignore error that this vars are void bacause upload is defines as voin funtion
      //@ts-ignore error that this vars are void bacause upload is defines as voin funtion
      const feed = await client.service('feed').patch(feedId, {
        ...feedItem,
        videoId: storedVideo?.file_id,
        previewId: storedPreview?.file_id
      })
      dispatch(editFeed(feed))
      //@ts-ignore
      const mediaLinks = { video: storedVideo.origin, preview: storedPreview.origin }
      return mediaLinks
    } catch (err) {
      dispatchAlertError(dispatch, err.message)
    }
  }
}

// export function updateFeed(feedId, files ,feedItem) {
//   return async (dispatch: Dispatch): Promise<any> => {
//     try {
//       const api = new Api()
//       const storedVideo = await api.upload(files.video, null)
//       const storedPreview = await api.upload(files.preview, null)

//       if(storedPreview && storedVideo){
//         const updatedFeed = await client.service('feed').patch(feedId, { ...feedItem })

//       }

//     } catch (err) {
//       console.log(err)
//       dispatchAlertError(dispatch, err.message)
//     }
//   }
// }

export function deleteFeed(feedId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('feed').remove(feedId)
      dispatch(removeFeed(feedId))
    } catch (err) {
      console.log(err)
    }
  }
}
