import mediasoup from 'mediasoup-client'

import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { getNearbyUsers } from '@etherealengine/engine/src/networking/functions/getNearbyUsers'
import { defineAction, defineState, dispatchAction, getMutableState, useState } from '@etherealengine/hyperflux'

import { MediaStreamState } from '../../transports/MediaStreams'
import { ConsumerExtension, SocketWebRTCClientNetwork } from '../../transports/SocketWebRTCClientFunctions'
import { accessNetworkUserState } from '../../user/services/NetworkUserService'

//State
export const MediaState = defineState({
  name: 'MediaState',
  initial: () => ({
    isCamVideoEnabled: false,
    isCamAudioEnabled: false,
    isScreenVideoEnabled: false,
    isScreenAudioEnabled: false,
    isFaceTrackingEnabled: false,
    enableBydefault: true,
    nearbyLayerUsers: [] as UserId[],
    consumers: [] as ConsumerExtension[]
  })
})

export const MediaServiceReceptor = (action) => {
  const s = getMutableState(MediaState)
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
}
/**@deprecated use getMutableState directly instead */
export const accessMediaStreamState = () => getMutableState(MediaState)
/**@deprecated use useHookstate(getMutableState(...) directly instead */
export const useMediaStreamState = () => useState(accessMediaStreamState())

let updateConsumerTimeout

//Service
export const MediaStreamService = {
  updateCamVideoState: () => {
    const mediaStreamState = getMutableState(MediaStreamState)
    dispatchAction(
      MediaStreamAction.setCamVideoStateAction({
        isEnable: mediaStreamState.camVideoProducer.value != null && !mediaStreamState.videoPaused.value
      })
    )
  },
  updateCamAudioState: () => {
    const mediaStreamState = getMutableState(MediaStreamState)
    dispatchAction(
      MediaStreamAction.setCamAudioStateAction({
        isEnable: mediaStreamState.camAudioProducer.value != null && !mediaStreamState.audioPaused.value
      })
    )
  },
  updateScreenVideoState: () => {
    const mediaStreamState = getMutableState(MediaStreamState)
    dispatchAction(
      MediaStreamAction.setScreenVideoStateAction({
        isEnable: mediaStreamState.screenVideoProducer.value != null && !mediaStreamState.screenShareVideoPaused.value
      })
    )
  },
  updateScreenAudioState: () => {
    const mediaStreamState = getMutableState(MediaStreamState)
    dispatchAction(
      MediaStreamAction.setScreenAudioStateAction({
        isEnable: mediaStreamState.screenAudioProducer.value != null && !mediaStreamState.screenShareAudioPaused.value
      })
    )
  },
  triggerUpdateConsumers: () => {
    if (!updateConsumerTimeout) {
      updateConsumerTimeout = setTimeout(() => {
        const mediaNetwork = Engine.instance.mediaNetwork as SocketWebRTCClientNetwork
        if (mediaNetwork) dispatchAction(MediaStreamAction.setConsumersAction({ consumers: mediaNetwork.consumers }))
        updateConsumerTimeout = null
      }, 1000)
    }
  },
  updateNearbyLayerUsers: () => {
    const mediaState = getMutableState(MediaState)
    const UserState = accessNetworkUserState()

    const nonPartyUserIds = UserState.layerUsers
      .filter((user) => user.partyId.value == null)
      .map((user) => user.id.value)
    const nearbyUsers = getNearbyUsers(Engine.instance.userId, nonPartyUserIds)
    if (JSON.stringify(mediaState.nearbyLayerUsers.value) !== JSON.stringify(nearbyUsers))
      mediaState.nearbyLayerUsers.set(nearbyUsers)
  },
  updateFaceTrackingState: () => {
    const mediaStreamState = getMutableState(MediaStreamState)
    dispatchAction(MediaStreamAction.setFaceTrackingStateAction({ isEnable: mediaStreamState.faceTracking.value }))
  },
  updateEnableMediaByDefault: () => {
    dispatchAction(MediaStreamAction.setMediaEnabledByDefaultAction({ isEnable: false }))
  }
}

//Action
export type BooleanAction = { [key: string]: boolean }
export class MediaStreamAction {
  static setCamVideoStateAction = defineAction({
    type: 'ee.client.MediaStream.CAM_VIDEO_CHANGED' as const,
    isEnable: matches.boolean
  })

  static setCamAudioStateAction = defineAction({
    type: 'ee.client.MediaStream.CAM_AUDIO_CHANGED' as const,
    isEnable: matches.boolean
  })

  static setScreenVideoStateAction = defineAction({
    type: 'ee.client.MediaStream.SCREEN_VIDEO_CHANGED' as const,
    isEnable: matches.boolean
  })

  static setScreenAudioStateAction = defineAction({
    type: 'ee.client.MediaStream.SCREEN_AUDIO_CHANGED' as const,
    isEnable: matches.boolean
  })

  static setFaceTrackingStateAction = defineAction({
    type: 'ee.client.MediaStream.FACE_TRACKING_CHANGED' as const,
    isEnable: matches.boolean
  })

  static setMediaEnabledByDefaultAction = defineAction({
    type: 'ee.client.MediaStream.MEDIA_ENABLE_BY_DEFAULT' as const,
    isEnable: matches.boolean
  })

  static setConsumersAction = defineAction({
    type: 'ee.client.MediaStream.CONSUMERS_CHANGED' as const,
    consumers: matches.any
  })
}
