import { createState, useState, none, Downgraded } from '@hookstate/core'
import { VideoActionType } from './VideoActions'

const state = createState({
  videos: [],
  error: ''
})

export const videoReducer = (_, action: VideoActionType) => {
  Promise.resolve().then(() => videoReceptor(action))
  return state.attach(Downgraded).value
}

export default function videoReceptor(action: VideoActionType): any {
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
export const useVideoState = () => useState(state)
