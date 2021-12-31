import axios from 'axios'
import { Config } from '@xrengine/common/src/config'
import { client } from '../../feathers'
import { AlertService } from '../../common/services/AlertService'
import { PublicVideo, VideoAction } from '../../media/services/VideoService'
import { useAuthState } from '../../user/services/AuthService'
import { useDispatch, store } from '../../store'
import { createState, useState } from '@hookstate/core'
import {
  VideoCreationForm,
  VideoUpdateForm,
  VideoCreatedResponse,
  VideoUpdatedResponse,
  VideoDeletedResponse
} from '@xrengine/common/src/interfaces/AdminService'

//State
export const ADMIN_PAGE_LIMIT = 100

const state = createState({
  data: {}
})

store.receptors.push((action: AdminActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'VIDEO_CREATED':
        return s.merge({ data: action.data })
    }
  }, action.type)
})

export const accessAdminState = () => state
export const useAdminState = () => useState(state) as any as typeof state

//Service
export const AdminService = {
  createVideo: async (data: VideoCreationForm) => {
    const dispatch = useDispatch()
    const token = useAuthState().authUser.accessToken.value
    try {
      const res = await axios.post(`https://${globalThis.process.env['VITE_SERVER_HOST']}/video`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        }
      })
      const result = res.data as VideoCreatedResponse
      AlertService.dispatchAlertSuccess('Video uploaded')
      dispatch(AdminAction.videoCreated(result))
    } catch (err) {
      AlertService.dispatchAlertError(new Error('Video upload error: ' + err.response.data.message))
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

export const AdminAction = {
  videoCreated: (data: VideoCreatedResponse) => {
    return {
      type: 'VIDEO_CREATED' as const,
      data: data
    }
  },
  videoUpdated: (data: VideoUpdatedResponse) => {
    return {
      type: 'VIDEO_UPDATED' as const,
      data: data
    }
  },
  videoDeleted: (data: VideoDeletedResponse) => {
    return {
      type: 'VIDEO_DELETED' as const,
      data: data
    }
  }
}

export type AdminActionType = ReturnType<typeof AdminAction[keyof typeof AdminAction]>
