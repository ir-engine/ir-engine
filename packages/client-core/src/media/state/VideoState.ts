import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'

import { VideoActionType, PublicVideo } from './VideoActions'

const state = createState({
  videos: [] as Array<PublicVideo>,
  error: ''
})

export function receptor(action: VideoActionType): any {
  state.batch((s) => {
    switch (action.type) {
      case 'VIDEOS_FETCHED_SUCCESS': {
        // combine existing videos with new videos given in action
        const currentVideos = state.videos.value
        const bothVideoSets = [...currentVideos, ...action.videos]
        const uniqueVideos = Array.from(new Set(bothVideoSets.map((a) => a.id))).map((id) => {
          return bothVideoSets.find((a) => a.id === id)
        })
        return s.merge({ videos: uniqueVideos })
      }
      case 'VIDEOS_FETCHED_ERROR':
        return s.merge({ error: action.message })
    }
  }, action.type)
}

export const accessVideoState = () => state

export const useVideoState = () => useState(state) as any as typeof state
