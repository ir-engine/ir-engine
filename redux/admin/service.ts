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

export function createVideo (data: VideoCreationForm) {
  return (dispatch: Dispatch) => {
    client.service('video').create(data)
      .then((createdVideo) => {
        dispatch(videoCreated(createdVideo))
      })
  }
}

export function updateVideo(data: VideoUpdateForm) {
  return (dispatch: Dispatch) => {
    client.service('static-resource').patch(data.id, data)
      .then((updatedVideo) => {
        dispatch(videoUpdated(updatedVideo))
      })
  }
}

export function deleteVideo(id: string) {
  return (dispatch: Dispatch) => {
    client.service('static-resource').remove(id)
      .then((removedVideo) => {
        dispatch(videoDeleted(removedVideo))
      })
  }
}

export function fetchAdminVideos () {
  return (dispatch: Dispatch) => {
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
