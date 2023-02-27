import { PeerID } from '@xrengine/common/src/interfaces/PeerID'
import { defineState, getState, none } from '@xrengine/hyperflux'

import { ConsumerExtension, ProducerExtension } from './SocketWebRTCClientNetwork'

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

export const PeerMediaStreamState = defineState({
  name: 'PeerMediaStreamState',
  initial: {} as {
    [peerID: PeerID]: {
      cam: PeerMediaStreamInterface
      screen: PeerMediaStreamInterface
    }
  }
})

export const createPeerMediaStream = (peerID: PeerID) => {
  console.log('createPeerMediaStream', peerID)
  const state = getState(PeerMediaStreamState)
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

export const removePeerMediaStream = (peerID: PeerID) => {
  console.log('removePeerMediaStream', peerID)
  const state = getState(PeerMediaStreamState)
  state[peerID].set(none)
}
