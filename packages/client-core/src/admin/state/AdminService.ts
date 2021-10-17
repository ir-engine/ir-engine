import { VideoCreationForm, VideoUpdateForm, AdminAction } from './AdminActions'

import axios from 'axios'
import { Config } from '@xrengine/common/src/config'
import { client } from '../../feathers'
import { AlertService } from '../../common/state/AlertService'
import { PublicVideo, VideoAction } from '../../media/state/VideoActions'
import { useAuthState } from '@xrengine/client-core/src/user/state/AuthState'
import { useDispatch } from '../../store'

export const AdminService = {
  createVideo: async (data: VideoCreationForm) => {
    const dispatch = useDispatch()
    const token = useAuthState().authUser.accessToken.value
    try {
      const res = await axios.post(`${Config.publicRuntimeConfig.apiServer}/video`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        }
      })
      const result = res.data
      AlertService.dispatchAlertSuccess('Video uploaded')
      dispatch(AdminAction.videoCreated(result))
    } catch (err) {
      AlertService.dispatchAlertError('Video upload error: ' + err.response.data.message)
    }
  },
  updateVideo: async (data: VideoUpdateForm) => {
    const dispatch = useDispatch()
    {
      client
        .service('static-resource')
        .patch(data.id, data)
        .then((updatedVideo) => {
          AlertService.dispatchAlertSuccess('Video updated')
          dispatch(AdminAction.videoUpdated(updatedVideo))
        })
    }
  },
  deleteVideo: async (id: string) => {
    const dispatch = useDispatch()
    {
      client
        .service('static-resource')
        .remove(id)
        .then((removedVideo) => {
          AlertService.dispatchAlertSuccess('Video deleted')
          dispatch(AdminAction.videoDeleted(removedVideo))
        })
    }
  },
  fetchAdminVideos: async () => {
    const dispatch = useDispatch()
    {
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
