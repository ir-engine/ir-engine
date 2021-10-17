import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'

import { MediaStreamActionType } from './MediaStreamActions'

const state = createState({
  isCamVideoEnabled: false,
  isCamAudioEnabled: false,
  isFaceTrackingEnabled: false,
  nearbyLayerUsers: [],
  consumers: {
    consumers: []
  }
})

export function receptor(action: MediaStreamActionType): any {
  state.batch((s) => {
    switch (action.type) {
      case 'CAM_VIDEO_CHANGED':
        return s.isCamVideoEnabled.set(action.isEnable)
      case 'CAM_AUDIO_CHANGED':
        return s.isCamAudioEnabled.set(action.isEnable)
      case 'FACE_TRACKING_CHANGED':
        return s.isFaceTrackingEnabled.set(action.isEnable)
      case 'CONSUMERS_CHANGED':
        return s.consumers.consumers.set(action.consumers)
      case 'NEARBY_LAYER_USERS_CHANGED':
        return s.nearbyLayerUsers.set(action.users.map((user) => user.id))
    }
  }, action.type)
}

export const accessMediaStreamState = () => state
export const useMediaStreamState = () => useState(state)
