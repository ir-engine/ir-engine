import { Dispatch } from 'redux'
import {
  VideoCreationForm,
  VideoUpdateForm,
  videoCreated,
  videoUpdated,
  videoDeleted
} from './actions'
import { client } from '../feathers'
import { PublicVideo, videosFetchedError, videosFetchedSuccess } from '../video/actions'
import axios from '../../../packages/server/tests/services/node_modules/axios'
import { apiUrl } from '../service.common'
import { dispatchAlertError, dispatchAlertSuccess } from '../alert/service'

export function createVideo (data: VideoCreationForm) {
  return async (dispatch: Dispatch, getState: any) => {
    const token = getState().get('auth').get('authUser').accessToken
    try {
      const res = await axios.post(`${apiUrl}/video`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        }
      })
      const result = res.data
      dispatchAlertSuccess(dispatch, 'Video uploaded')
      dispatch(videoCreated(result))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, 'Video upload error: ' + err.response.data.message)
    }
  }
}

export function updateVideo(data: VideoUpdateForm) {
  return (dispatch: Dispatch): any => {
    client.service('static-resource').patch(data.id, data)
      .then((updatedVideo) => {
        dispatchAlertSuccess(dispatch, 'Video updated')
        dispatch(videoUpdated(updatedVideo))
      })
  }
}

export function deleteVideo(id: string) {
  return (dispatch: Dispatch): any => {
    client.service('static-resource').remove(id)
      .then((removedVideo) => {
        dispatchAlertSuccess(dispatch, 'Video deleted')
        dispatch(videoDeleted(removedVideo))
      })
  }
}

export function fetchAdminVideos () {
  return (dispatch: Dispatch): any => {
    client.service('static-resource').find({
      query: {
        $limit: 100,
        mimeType: 'application/dash+xml'
      }
    })
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
