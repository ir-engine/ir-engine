// eslint-disable-next-line no-unused-vars
import { Dispatch } from 'redux'
import {
  videosFetchedSuccess,
  videosFetchedError,
  // eslint-disable-next-line no-unused-vars
  PublicVideo
} from './actions'
// import { ajaxPost } from "../service.common"
import { client } from '../feathers'

export function fetchPublicVideos() {
  return (dispatch: Dispatch) => {
    client.service('static-resource').find({ query: { mime_type: 'application/dash+xml' }})
      .then((res: any) => {
        const videos = res.data as PublicVideo[]

        return dispatch(videosFetchedSuccess(videos))
      })
      .catch(() => dispatch(videosFetchedError('Failed to fetch videos')))
  }
}
