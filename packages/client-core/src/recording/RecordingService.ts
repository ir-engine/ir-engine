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

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { ECSRecordingActions } from '@etherealengine/engine/src/ecs/ECSRecordingSystem'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { mocapDataChannelType } from '@etherealengine/engine/src/mocap/MotionCaptureSystem'
import {
  webcamAudioDataChannelType,
  webcamVideoDataChannelType
} from '@etherealengine/engine/src/networking/NetworkState'
import { defineState, receiveActions } from '@etherealengine/hyperflux'

import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { PhysicsSerialization } from '@etherealengine/engine/src/physics/PhysicsSerialization'
import {
  RecordingID,
  recordingPath,
  RecordingSchemaType
} from '@etherealengine/engine/src/schemas/recording/recording.schema'
import { NotificationService } from '../common/services/NotificationService'

export const RecordingState = defineState({
  name: 'ee.RecordingState',

  initial: {
    active: false,
    startedAt: null as number | null,
    recordingID: null as RecordingID | null
  },

  receptors: [
    [
      ECSRecordingActions.startRecording,
      (state, action: typeof ECSRecordingActions.startRecording.matches._TYPE) => {
        state.active.set(true)
        state.startedAt.set(null)
        state.recordingID.set(null)
      }
    ],
    [
      ECSRecordingActions.recordingStarted,
      (state, action: typeof ECSRecordingActions.recordingStarted.matches._TYPE) => {
        state.startedAt.set(Date.now())
        state.recordingID.set(action.recordingID)
      }
    ],
    [
      ECSRecordingActions.stopRecording,
      (state, action: typeof ECSRecordingActions.stopRecording.matches._TYPE) => {
        state.active.set(false)
        state.startedAt.set(null)
        state.recordingID.set(null)
      }
    ]
  ]
})

export const PlaybackState = defineState({
  name: 'ee.PlaybackState',

  initial: {
    recordingID: null as RecordingID | null,
    startedAt: null as number | null
  },

  receptors: [
    [
      ECSRecordingActions.playbackChanged,
      (state, action: typeof ECSRecordingActions.playbackChanged.matches._TYPE) => {
        state.recordingID.set(action.playing ? action.recordingID : null)
        state.startedAt.set(action.playing ? Date.now() : null)
      }
    ]
  ]
})

export type RecordingConfigSchema = {
  user: {
    Avatar: boolean
  }
  peers: Record<PeerID, { Audio: boolean; Video: boolean; Mocap: boolean }>
}

export const RecordingFunctions = {
  startRecording: async (peerSchema: RecordingConfigSchema) => {
    try {
      const userSchema = [] as string[]
      if (peerSchema.user.Avatar) userSchema.push(PhysicsSerialization.ID)

      const schema = {
        user: userSchema,
        peers: {}
      } as RecordingSchemaType

      if (peerSchema.user.Avatar) schema

      Object.entries(peerSchema.peers).forEach(([peerID, value]) => {
        const peerSchema = [] as string[]
        if (value.Mocap) peerSchema.push(mocapDataChannelType)
        if (value.Video) peerSchema.push(webcamVideoDataChannelType)
        if (value.Audio) peerSchema.push(webcamAudioDataChannelType)
        if (peerSchema.length) schema.peers[peerID] = peerSchema
      })

      const recording = await Engine.instance.api.service(recordingPath).create({ schema: schema })
      return recording.id
    } catch (err) {
      console.error(err)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export const RecordingServiceSystem = defineSystem({
  uuid: 'ee.client.RecordingServiceSystem',
  execute: () => {
    receiveActions(RecordingState)
    receiveActions(PlaybackState)
  }
})
