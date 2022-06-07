import { useState } from '@speigg/hookstate'

import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import {
  addActionReceptor,
  defineAction,
  defineState,
  dispatchAction,
  getState,
  registerState
} from '@xrengine/hyperflux'

import { client } from '../../feathers'

//State
const VideoState = defineState({
  name: 'VideoState',
  initial: () => ({
    videos: [] as Array<PublicVideo>,
    error: ''
  })
})

export const registerVideoServiceActions = () => {
  registerState(VideoState)

  addActionReceptor(function VideoServiceReceptor(action) {
    getState(VideoState).batch((s) => {
      matches(action)
        .when(VideoAction.videosFetchedSuccessAction.matches, (action) => {
          // combine existing videos with new videos given in action
          const currentVideos = getState(VideoState).videos.value
          const bothVideoSets = [...currentVideos, ...action.videos]
          const uniqueVideos = Array.from(new Set(bothVideoSets.map((a) => a.id))).map((id) => {
            return bothVideoSets.find((a) => a.id === id)!
          })
          return s.merge({ videos: uniqueVideos })
        })
        .when(VideoAction.videosFetchedErrorAction.matches, (action) => {
          return s.merge({ error: action.message })
        })
    })
  })
}

export const accessVideoState = () => getState(VideoState)

export const useVideoState = () => useState(accessVideoState()) as any as typeof VideoState

//Service
export const VideoService = {
  fetchPublicVideos: async (pageOffset = 0) => {
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
        return dispatchAction(VideoAction.videosFetchedSuccessAction({ videos }))
      })
      .catch(() => dispatchAction(VideoAction.videosFetchedErrorAction({ message: 'Failed to fetch videos' })))
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

export class VideoAction {
  static videosFetchedSuccessAction = defineAction({
    store: 'ENGINE',
    type: 'VIDEOS_FETCHED_SUCCESS' as const,
    videos: matches.array as Validator<unknown, PublicVideo[]>
  })

  static videosFetchedErrorAction = defineAction({
    store: 'ENGINE',
    type: 'VIDEOS_FETCHED_ERROR' as const,
    message: matches.string
  })
}
