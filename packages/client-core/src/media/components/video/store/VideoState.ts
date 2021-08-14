import { createState, useState, none } from '@hookstate/core'
import { PublicVideo } from '@xrengine/common/src/interfaces/Video'
import { VideoActionType } from './VideoAction'

const state = createState({
  videos: [] as Array<PublicVideo>,
  error: ''
})

export const VideoReducer = (_, action: VideoActionType) => {
  Promise.resolve().then(() => VideoReceptor(action))
  return state
}

export const VideoReceptor = (action: VideoActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'VIDEOS_FETCHED_SUCCESS': {
        return s.merge({ videos: action.videos })
      }
      case 'VIDEOS_FETCHED_ERROR':
        return s.merge({ error: action.message })
    }
  }, action.type)
}

export const accessVideoState = () => state
export const useVideostate = () => useState(state)
