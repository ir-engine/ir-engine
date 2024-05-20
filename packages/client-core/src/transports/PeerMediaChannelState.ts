/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { defineState, getMutableState, none, PeerID } from '@etherealengine/hyperflux'

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
