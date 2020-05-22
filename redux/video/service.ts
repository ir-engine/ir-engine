import { Dispatch } from 'redux'
import {
  videosFetchedSuccess,
  videosFetchedError,
  // fileUploadFailure,
  fileUploadSuccess,
  // eslint-disable-next-line no-unused-vars
  PublicVideo
} from './actions'
import axios from 'axios'
import { apiUrl } from '../service.common'
import { client } from '../feathers'

export function fetchPublicVideos () {
  return (dispatch: Dispatch) => {
    client.service('static-resource').find({ query: { $limit: 100, mimeType: 'application/dash+xml' } })
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

export function uploadFile (data: any) {
  return async (dispatch: Dispatch, getState: any) => {
    const token = getState().get('auth').get('authUser').accessToken
    const res = await axios.post(`${apiUrl}/upload`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + token
      }
    })
    const image = res.data
    dispatch(fileUploadSuccess(image))
  }
}
