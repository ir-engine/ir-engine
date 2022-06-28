import mediasoup from 'mediasoup-client'

import { MediaStreams } from '@xrengine/client-core/src/transports/MediaStreams'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { NearbyUser } from '@xrengine/engine/src/networking/functions/getNearbyUsers'
import { addActionReceptor, defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { SocketWebRTCClientNetwork } from '../../transports/SocketWebRTCClientNetwork'

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

export const MediaServiceReceptor = (action) => {
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
}

export const accessMediaStreamState = () => getState(MediaState)
export const useMediaStreamState = () => useState(accessMediaStreamState())

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
        const mediaNetwork = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
        dispatchAction(MediaStreamAction.setConsumersAction({ consumers: mediaNetwork.consumers }))
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
    type: 'CAM_VIDEO_CHANGED' as const,
    isEnable: matches.boolean
  })

  static setCamAudioStateAction = defineAction({
    type: 'CAM_AUDIO_CHANGED' as const,
    isEnable: matches.boolean
  })

  static setScreenVideoStateAction = defineAction({
    type: 'SCREEN_VIDEO_CHANGED' as const,
    isEnable: matches.boolean
  })

  static setScreenAudioStateAction = defineAction({
    type: 'SCREEN_AUDIO_CHANGED' as const,
    isEnable: matches.boolean
  })

  static setFaceTrackingStateAction = defineAction({
    type: 'FACE_TRACKING_CHANGED' as const,
    isEnable: matches.boolean
  })

  static setMediaEnabledByDefaultAction = defineAction({
    type: 'MEDIA_ENABLE_BY_DEFAULT' as const,
    isEnable: matches.boolean
  })

  static setConsumersAction = defineAction({
    type: 'CONSUMERS_CHANGED' as const,
    consumers: matches.any
  })

  static setNearbyLayerUsersAction = defineAction({
    type: 'NEARBY_LAYER_USERS_CHANGED' as const,
    users: matches.array as Validator<unknown, NearbyUser[]>
  })
}
