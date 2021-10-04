import { Dispatch } from 'redux'
import { VideoCreationForm, VideoUpdateForm, AdminAction } from './AdminActions'

import axios from 'axios'
import { Config } from '@xrengine/common/src/config'
import { client } from '../../../feathers'
import { AlertService } from '../../../common/reducers/alert/AlertService'
import { PublicVideo, VideoAction } from '../../../media/components/video/VideoActions'
import { useAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'

export const AdminService = {
  createVideo: (data: VideoCreationForm) => {
    return async (dispatch: Dispatch, getState: any) => {
      const token = useAuthState().authUser.accessToken.value
      try {
        const res = await axios.post(`${Config.publicRuntimeConfig.apiServer}/video`, data, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
          }
        })
        const result = res.data
        AlertService.dispatchAlertSuccess(dispatch, 'Video uploaded')
        dispatch(AdminAction.videoCreated(result))
      } catch (err) {
        AlertService.dispatchAlertError(dispatch, 'Video upload error: ' + err.response.data.message)
      }
    }
  },
  updateVideo: (data: VideoUpdateForm) => {
    return (dispatch: Dispatch): any => {
      client
        .service('static-resource')
        .patch(data.id, data)
        .then((updatedVideo) => {
          AlertService.dispatchAlertSuccess(dispatch, 'Video updated')
          dispatch(AdminAction.videoUpdated(updatedVideo))
        })
    }
  },
  deleteVideo: (id: string) => {
    return (dispatch: Dispatch): any => {
      client
        .service('static-resource')
        .remove(id)
        .then((removedVideo) => {
          AlertService.dispatchAlertSuccess(dispatch, 'Video deleted')
          dispatch(AdminAction.videoDeleted(removedVideo))
        })
    }
  },
  fetchAdminVideos: () => {
    return (dispatch: Dispatch): any => {
      client
        .service('static-resource')
        .find({
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
          return dispatch(VideoAction.videosFetchedSuccess(videos))
        })
        .catch(() => dispatch(VideoAction.videosFetchedError('Failed to fetch videos')))
    }
  }
}
