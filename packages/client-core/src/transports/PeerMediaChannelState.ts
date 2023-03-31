import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { defineState, getMutableState, none } from '@etherealengine/hyperflux'

import { ConsumerExtension, ProducerExtension } from './SocketWebRTCClientFunctions'

export interface PeerMediaStreamInterface {
  videoStream: ProducerExtension | ConsumerExtension | null
  audioStream: ProducerExtension | ConsumerExtension | null
  videoStreamPaused: boolean
  audioStreamPaused: boolean
  videoProducerPaused: boolean
  audioProducerPaused: boolean
  videoProducerGlobalMute: boolean
  audioProducerGlobalMute: boolean
  videoElement: HTMLVideoElement
  audioElement: HTMLAudioElement
}

export const PeerMediaChannelState = defineState({
  name: 'PeerMediaChannelState',
  initial: {} as {
    [peerID: PeerID]: {
      cam: PeerMediaStreamInterface
      screen: PeerMediaStreamInterface
    }
  }
})

export const createPeerMediaChannels = (peerID: PeerID) => {
  console.log('createPeerMediaChannels', peerID)
  const state = getMutableState(PeerMediaChannelState)
  state[peerID].set({
    cam: {
      videoStream: null,
      audioStream: null,
      videoStreamPaused: false,
      audioStreamPaused: false,
      videoProducerPaused: false,
      audioProducerPaused: false,
      videoProducerGlobalMute: false,
      audioProducerGlobalMute: false,
      videoElement: document.createElement('video'),
      audioElement: document.createElement('audio')
    },
    screen: {
      videoStream: null,
      audioStream: null,
      videoStreamPaused: false,
      audioStreamPaused: false,
      videoProducerPaused: false,
      audioProducerPaused: false,
      videoProducerGlobalMute: false,
      audioProducerGlobalMute: false,
      videoElement: document.createElement('video'),
      audioElement: document.createElement('audio')
    }
  })
}

export const removePeerMediaChannels = (peerID: PeerID) => {
  console.log('removePeerMediaChannels', peerID)
  const state = getMutableState(PeerMediaChannelState)
  state[peerID].set(none)
}

export const clearPeerMediaChannels = () => {
  console.log('clearPeerMediaChannels')
  getMutableState(PeerMediaChannelState).set({})
}
