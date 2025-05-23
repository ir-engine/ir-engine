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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025 
Infinite Reality Engine. All Rights Reserved.
*/

import { defineState, getMutableState, none, OpaqueType, PeerID } from '@ir-engine/hyperflux'

export type MediaChannelType = OpaqueType<'MediaChannelType'> & string

export const webcamVideoMediaChannelType = 'ir.core.webcamVideo.mediaChannel' as MediaChannelType
export const webcamAudioMediaChannelType = 'ir.core.webcamAudio.mediaChannel' as MediaChannelType
export const screenshareVideoMediaChannelType = 'ir.core.screenshareVideo.mediaChannel' as MediaChannelType
export const screenshareAudioMediaChannelType = 'ir.core.screenshareAudio.mediaChannel' as MediaChannelType

export interface MediaStreamInterface {
  stream: MediaStream | null
  quality: 'smallest' | 'auto' | 'largest'
  paused: boolean
  element: HTMLMediaElement
}

export const MediaChannelState = defineState({
  name: 'MediaChannelState',
  initial: {} as {
    [peerID: PeerID]: {
      [mediaTag: MediaChannelType]: MediaStreamInterface
    }
  }
})

export const createPeerMediaChannels = (peerID: PeerID) => {
  console.log('createPeerMediaChannels', peerID)
  const state = getMutableState(MediaChannelState)
  state[peerID].set({
    [webcamAudioMediaChannelType]: {
      stream: null,
      quality: 'smallest',
      paused: false,
      element: document.createElement('audio')
    },
    [webcamVideoMediaChannelType]: {
      stream: null,
      quality: 'smallest',
      paused: false,
      element: document.createElement('video')
    },
    [screenshareAudioMediaChannelType]: {
      stream: null,
      quality: 'auto',
      paused: false,
      element: document.createElement('audio')
    },
    [screenshareVideoMediaChannelType]: {
      stream: null,
      quality: 'auto',
      paused: false,
      element: document.createElement('video')
    }
  })
}

export const removePeerMediaChannels = (peerID: PeerID) => {
  console.log('removePeerMediaChannels', peerID)
  const state = getMutableState(MediaChannelState)
  state[peerID].set(none)
}
