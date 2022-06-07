import { useState } from '@speigg/hookstate'
import mediasoup from 'mediasoup-client'

import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { NearbyUser } from '@xrengine/engine/src/networking/functions/getNearbyUsers'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import {
  addActionReceptor,
  defineAction,
  defineState,
  dispatchAction,
  getState,
  registerState
} from '@xrengine/hyperflux'

//State
const MediaState = defineState({
  name: 'MediaState',
  initial: () => ({
    isCamVideoEnabled: false,
    isCamAudioEnabled: false,
    isScreenVideoEnabled: false,
    isScreenAudioEnabled: false,
    isFaceTrackingEnabled: false,
    enableBydefault: true,
    nearbyLayerUsers: [] as NearbyUser[],
    consumers: [] as mediasoup.types.Consumer[]
  })
})

export const registerMediaServiceActions = () => {
  registerState(MediaState)

  addActionReceptor(function MediaServiceReceptor(action) {
    getState(MediaState).batch((s) => {
      matches(action)
        .when(MediaStreamAction.setCamVideoStateAction.matches, (action) => {
          return s.isCamVideoEnabled.set(action.isEnable)
        })
        .when(MediaStreamAction.setCamAudioStateAction.matches, (action) => {
          return s.isCamAudioEnabled.set(action.isEnable)
        })
        .when(MediaStreamAction.setScreenVideoStateAction.matches, (action) => {
          return s.isScreenVideoEnabled.set(action.isEnable)
        })
        .when(MediaStreamAction.setScreenAudioStateAction.matches, (action) => {
          return s.isScreenAudioEnabled.set(action.isEnable)
        })
        .when(MediaStreamAction.setFaceTrackingStateAction.matches, (action) => {
          return s.isFaceTrackingEnabled.set(action.isEnable)
        })
        .when(MediaStreamAction.setMediaEnabledByDefaultAction.matches, (action) => {
          return s.enableBydefault.set(action.isEnable)
        })
        .when(MediaStreamAction.setConsumersAction.matches, (action) => {
          return s.consumers.set(action.consumers)
        })
        .when(MediaStreamAction.setNearbyLayerUsersAction.matches, (action) => {
          return s.nearbyLayerUsers.set(action.users)
        })
    })
  })
}

registerMediaServiceActions()

export const accessMediaStreamState = () => getState(MediaState)
export const useMediaStreamState = () => useState(accessMediaStreamState()) as any as typeof MediaState

let updateConsumerTimeout

//Service
export const MediaStreamService = {
  updateCamVideoState: () => {
    dispatchAction(
      MediaStreamAction.setCamVideoStateAction({
        isEnable: MediaStreams.instance.camVideoProducer != null && !MediaStreams.instance.videoPaused
      })
    )
  },
  updateCamAudioState: () => {
    dispatchAction(
      MediaStreamAction.setCamAudioStateAction({
        isEnable: MediaStreams.instance.camAudioProducer != null && !MediaStreams.instance.audioPaused
      })
    )
  },
  updateScreenVideoState: () => {
    dispatchAction(
      MediaStreamAction.setScreenVideoStateAction({
        isEnable: MediaStreams.instance.screenVideoProducer != null && !MediaStreams.instance.screenShareVideoPaused
      })
    )
  },
  updateScreenAudioState: () => {
    dispatchAction(
      MediaStreamAction.setScreenAudioStateAction({
        isEnable: MediaStreams.instance.screenAudioProducer != null && !MediaStreams.instance.screenShareAudioPaused
      })
    )
  },
  triggerUpdateConsumers: () => {
    if (!updateConsumerTimeout) {
      updateConsumerTimeout = setTimeout(() => {
        dispatchAction(MediaStreamAction.setConsumersAction({ consumers: MediaStreams.instance.consumers }))
        updateConsumerTimeout = null
      }, 1000)
    }
  },
  triggerUpdateNearbyLayerUsers: () => {
    dispatchAction(MediaStreamAction.setNearbyLayerUsersAction({ users: MediaStreams.instance.nearbyLayerUsers }))
  },
  updateFaceTrackingState: () => {
    dispatchAction(MediaStreamAction.setFaceTrackingStateAction({ isEnable: MediaStreams.instance.faceTracking }))
  },
  updateEnableMediaByDefault: () => {
    dispatchAction(MediaStreamAction.setMediaEnabledByDefaultAction({ isEnable: false }))
  }
}

//Action
export type BooleanAction = { [key: string]: boolean }
export class MediaStreamAction {
  static setCamVideoStateAction = defineAction({
    store: 'ENGINE',
    type: 'CAM_VIDEO_CHANGED' as const,
    isEnable: matches.boolean
  })

  static setCamAudioStateAction = defineAction({
    store: 'ENGINE',
    type: 'CAM_AUDIO_CHANGED' as const,
    isEnable: matches.boolean
  })

  static setScreenVideoStateAction = defineAction({
    store: 'ENGINE',
    type: 'SCREEN_VIDEO_CHANGED' as const,
    isEnable: matches.boolean
  })

  static setScreenAudioStateAction = defineAction({
    store: 'ENGINE',
    type: 'SCREEN_AUDIO_CHANGED' as const,
    isEnable: matches.boolean
  })

  static setFaceTrackingStateAction = defineAction({
    store: 'ENGINE',
    type: 'FACE_TRACKING_CHANGED' as const,
    isEnable: matches.boolean
  })

  static setMediaEnabledByDefaultAction = defineAction({
    store: 'ENGINE',
    type: 'MEDIA_ENABLE_BY_DEFAULT' as const,
    isEnable: matches.boolean
  })

  static setConsumersAction = defineAction({
    store: 'ENGINE',
    type: 'CONSUMERS_CHANGED' as const,
    consumers: matches.any
  })

  static setNearbyLayerUsersAction = defineAction({
    store: 'ENGINE',
    type: 'NEARBY_LAYER_USERS_CHANGED' as const,
    users: matches.array as Validator<unknown, NearbyUser[]>
  })
}
