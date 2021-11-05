import { store, useDispatch } from '../../store'
import { client } from '../../feathers'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'

//State
const state = createState({
  videos: [] as Array<PublicVideo>,
  error: ''
})

store.receptors.push((action: VideoActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'VIDEOS_FETCHED_SUCCESS': {
        // combine existing videos with new videos given in action
        const currentVideos = state.videos.value
        const bothVideoSets = [...currentVideos, ...action.videos]
        const uniqueVideos = Array.from(new Set(bothVideoSets.map((a) => a.id))).map((id) => {
          return bothVideoSets.find((a) => a.id === id)!
        })
        return s.merge({ videos: uniqueVideos })
      }
      case 'VIDEOS_FETCHED_ERROR':
        return s.merge({ error: action.message })
    }
  }, action.type)
})

export const accessVideoState = () => state

export const useVideoState = () => useState(state) as any as typeof state

//Service
export const VideoService = {
  fetchPublicVideos: async (pageOffset = 0) => {
    const dispatch = useDispatch()
    {
      // loads next pages videos +1
      // doesn't work with a lower number
      // must load next page and at least 1 video of page after that
      // for grid arrows to show, and for videos to show on click arrow.
      const nVideosToLoad = 31
      client
        .service('static-resource')
        .find({ query: { $limit: nVideosToLoad, $skip: nVideosToLoad * pageOffset, mimeType: 'application/dash+xml' } })
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

//Action
export interface PublicVideoState {
  videos: PublicVideo[]
  error: string
}

export interface VideoMetaData {
  thumbnailUrl?: string
  '360_format'?: string
  rating?: string
  categories?: string[]
  runtime?: string
}

export interface PublicVideo {
  id: number
  name: string
  description: string
  url: string
  metadata: Partial<VideoMetaData>
}
export interface Image {
  id: number
  name: string
  type: string
  url: string
}

export interface UploadAction {
  type: string
  payload?: any
  message?: string
}

export const VideoAction = {
  videosFetchedSuccess: (videos: PublicVideo[]) => {
    return {
      type: 'VIDEOS_FETCHED_SUCCESS' as const,
      videos: videos
    }
  },
  videosFetchedError: (err: string) => {
    return {
      type: 'VIDEOS_FETCHED_ERROR' as const,
      message: err
    }
  }
}

export type VideoActionType = ReturnType<typeof VideoAction[keyof typeof VideoAction]>
