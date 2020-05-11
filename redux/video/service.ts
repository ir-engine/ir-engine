import { Dispatch } from 'redux'
import {
  videosFetchedSuccess,
  videosFetchedError,
  PublicVideo
} from './actions'
// import { ajaxPost } from '../service.common'
import { client } from '../feathers'

export function fetchPublicVideos() {
  return (dispatch: Dispatch) => {
    client.service('static-resource').find({ query: { $limit: 30, mime_type: 'application/dash+xml' } })
      .then((res: any) => {
        for (const video of res.data) {
          video.metadata = JSON.parse(video.metadata)
        }
        const videos = res.data as PublicVideo[]

        return dispatch(videosFetchedSuccess(videos))
      })
      .catch(() => dispatch(videosFetchedError('Failed to fetch videos')))
  }
}
