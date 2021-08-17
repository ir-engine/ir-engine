import { createState, useState, none, Downgraded } from '@hookstate/core'
import { PublicVideo } from '@xrengine/common/src/interfaces/Video'
import { VideoActionType } from './VideoAction'

const state = createState({
  videos: [] as Array<PublicVideo>,
  error: ''
})

export const VideoReducer = (_, action: VideoActionType) => {
  Promise.resolve().then(() => VideoReceptor(action))
  return state.attach(Downgraded).value
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
export const useVideoState = () => useState(state)
