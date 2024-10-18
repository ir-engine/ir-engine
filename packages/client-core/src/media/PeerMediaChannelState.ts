/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { defineState, getMutableState, none, PeerID } from '@ir-engine/hyperflux'

export interface PeerMediaStreamInterface {
  videoMediaStream: MediaStream | null
  audioMediaStream: MediaStream | null
  videoQuality: 'smallest' | 'auto' | 'largest'
  videoStreamPaused: boolean
  audioStreamPaused: boolean
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
      videoMediaStream: null,
      audioMediaStream: null,
      videoQuality: 'smallest',
      videoStreamPaused: false,
      audioStreamPaused: false,
      videoElement: document.createElement('video'),
      audioElement: document.createElement('audio')
    },
    screen: {
      videoMediaStream: null,
      audioMediaStream: null,
      videoQuality: 'auto',
      videoStreamPaused: false,
      audioStreamPaused: false,
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
