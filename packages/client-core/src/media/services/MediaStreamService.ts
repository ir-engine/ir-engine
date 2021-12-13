import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { store } from '../../store'
import { createState, useState } from '@hookstate/core'
import { NearbyUser } from '@xrengine/engine/src/networking/functions/getNearbyUsers'

//State
const state = createState({
  isCamVideoEnabled: false,
  isCamAudioEnabled: false,
  isFaceTrackingEnabled: false,
  nearbyLayerUsers: [] as NearbyUser[],
  consumers: []
})

store.receptors.push((action: MediaStreamActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'CAM_VIDEO_CHANGED':
        return s.isCamVideoEnabled.set(action.isEnable)
      case 'CAM_AUDIO_CHANGED':
        return s.isCamAudioEnabled.set(action.isEnable)
      case 'FACE_TRACKING_CHANGED':
        return s.isFaceTrackingEnabled.set(action.isEnable)
      case 'CONSUMERS_CHANGED':
        return s.consumers.set(action.consumers)
      case 'NEARBY_LAYER_USERS_CHANGED':
        return s.nearbyLayerUsers.set(action.users)
    }
  }, action.type)
})

export const accessMediaStreamState = () => state
export const useMediaStreamState = () => useState(state)

//Service
export const MediaStreamService = {
  updateCamVideoState: () => {
    const ms = MediaStreams.instance
    store.dispatch(MediaStreamAction.setCamVideoState(ms != null && ms.camVideoProducer != null && !ms.videoPaused))
  },
  triggerUpdateConsumers: () => {
    const ms = MediaStreams.instance
    store.dispatch(MediaStreamAction.setConsumers(ms != null ? ms.consumers : []))
  },
  triggerUpdateNearbyLayerUsers: () => {
    const ms = MediaStreams.instance
    store.dispatch(MediaStreamAction.setNearbyLayerUsers(ms != null ? ms.nearbyLayerUsers : []))
  },
  updateCamAudioState: () => {
    const ms = MediaStreams.instance
    store.dispatch(MediaStreamAction.setCamAudioState(ms != null && ms.camAudioProducer != null && !ms.audioPaused))
  },
  updateFaceTrackingState: () => {
    const ms = MediaStreams.instance
    store.dispatch(MediaStreamAction.setFaceTrackingState(ms && ms.faceTracking))
  }
}

//Action
export type BooleanAction = { [key: string]: boolean }
export const MediaStreamAction = {
  setCamVideoState: (isEnable: boolean) => {
    return { type: 'CAM_VIDEO_CHANGED' as const, isEnable: isEnable }
  },
  setCamAudioState: (isEnable: boolean) => {
    return { type: 'CAM_AUDIO_CHANGED' as const, isEnable }
  },
  setFaceTrackingState: (isEnable: boolean) => {
    return { type: 'FACE_TRACKING_CHANGED' as const, isEnable }
  },
  setConsumers: (consumers: any[]): any => {
    return { type: 'CONSUMERS_CHANGED' as const, consumers }
  },
  setNearbyLayerUsers: (users: NearbyUser[]): any => {
    return { type: 'NEARBY_LAYER_USERS_CHANGED' as const, users }
  }
}

export type MediaStreamActionType = ReturnType<typeof MediaStreamAction[keyof typeof MediaStreamAction]>
