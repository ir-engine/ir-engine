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

import { RecordingResult } from '@etherealengine/common/src/interfaces/Recording'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { ECSRecordingActions } from '@etherealengine/engine/src/ecs/ECSRecording'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { mocapDataChannelType } from '@etherealengine/engine/src/mocap/MotionCaptureSystem'
import { webcamVideoDataChannelType } from '@etherealengine/engine/src/networking/NetworkState'
import { PhysicsSerialization } from '@etherealengine/engine/src/physics/PhysicsSerialization'
import { defineState, getMutableState, getState, receiveActions } from '@etherealengine/hyperflux'

import { NotificationService } from '../common/services/NotificationService'

export const RecordingState = defineState({
  name: 'ee.RecordingState',

  initial: {
    started: false,
    recordingID: null as string | null,
    config: {
      mocap: true,
      video: true,
      pose: true
    },
    recordings: [] as RecordingResult[],
    playback: null as string | null
  },

  receptors: [
    [
      ECSRecordingActions.startRecording,
      (state, action) => {
        state.started.set(true)
      }
    ],
    [
      ECSRecordingActions.recordingStarted,
      (state, action) => {
        state.started.set(true)
        state.recordingID.set(action.recordingID)
      }
    ],
    [
      ECSRecordingActions.stopRecording,
      (state, action) => {
        state.started.set(false)
        state.recordingID.set(null)
      }
    ],
    [
      ECSRecordingActions.playbackChanged,
      (state, action) => {
        state.playback.set(action.playing ? action.recordingID : null)
      }
    ]
  ]
})

export const RecordingFunctions = {
  startRecording: async () => {
    try {
      const state = getState(RecordingState)
      const schema = [] as string[]
      if (state.config.pose) {
        schema.push(PhysicsSerialization.ID)
      }
      if (state.config.mocap) {
        schema.push(mocapDataChannelType)
      }
      if (state.config.video) {
        schema.push(webcamVideoDataChannelType)
      }
      const recording = (await Engine.instance.api.service('recording').create({
        schema: JSON.stringify(schema)
      })) as RecordingResult
      return recording.id
    } catch (err) {
      console.error(err)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  getRecordings: async () => {
    // const recordings = await Engine.instance?.api?.service('recording')?.find().then(res => res?.data) as RecordingResult[]
    //)?.data as RecordingResult[]

    return await Engine.instance?.api
      ?.service('recording')
      ?.find()
      .then(
        (res) => {
          const recordingState = getMutableState(RecordingState)
          recordingState.recordings.set(res.data)
          return true
        },
        function (err) {
          console.log(err)
          return false
        }
      ) // never supposed to reject
  }
}

export const RecordingServiceSystem = defineSystem({
  uuid: 'ee.client.RecordingServiceSystem',
  execute: () => {
    receiveActions(RecordingState)
  }
})
