import { useEffect } from 'react'

import { RecordingResult } from '@etherealengine/common/src/interfaces/Recording'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { ECSRecordingActions } from '@etherealengine/engine/src/ecs/ECSRecording'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { mocapDataChannelType } from '@etherealengine/engine/src/mocap/MotionCaptureSystem'
import { webcamVideoDataChannelType } from '@etherealengine/engine/src/networking/NetworkState'
import { PhysicsSerialization } from '@etherealengine/engine/src/physics/PhysicsSerialization'
import { defineActionQueue, defineState, getMutableState, getState, useMutableState } from '@etherealengine/hyperflux'

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

  //@ts-ignore
  receptors: [
    [
      ECSRecordingActions.startRecording.matches,
      (state, action) => {
        state.started.set(true)
        state.recordingID.set(action.recordingID)
      }
    ],
    [
      ECSRecordingActions.recordingStarted.matches,
      (state, action) => {
        state.started.set(false)
        state.recordingID.set(null)
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

const recordingActions = defineActionQueue(ECSRecordingActions)
const recordingStartedQueue = defineActionQueue(ECSRecordingActions.recordingStarted.matches)
const stopRecordingQueue = defineActionQueue(ECSRecordingActions.stopRecording.matches)
const playbackChangedQueue = defineActionQueue(ECSRecordingActions.playbackChanged.matches)

const execute = () => {
  const recordingState = getMutableState(RecordingState)

  for (const action of recordingStartedQueue()) {
    recordingState.started.set(true)
    recordingState.recordingID.set(action.recordingID)
  }

  for (const action of startRecordingQueue()) {
    recordingState.started.set(true)
  }

  for (const action of stopRecordingQueue()) {
    recordingState.started.set(false)
    recordingState.recordingID.set(null)
  }

  for (const action of playbackChangedQueue()) {
    recordingState.playback.set(action.playing ? action.recordingID : null)
  }
}

export const RecordingServiceSystem = defineSystem({
  uuid: 'ee.client.RecordingServiceSystem',
  execute,
  reactor: () => {
    const recordingState = useMutableState(RecordingState, 'started')
    const recordingActions = useActionQueue([
      ECSRecordingActions.startRecording.matches,
      ECSRecordingActions.stopRecording.matches
    ])

    useEffect(() => {
      for (const action of recordingActions) {
        recordingState.set(action.type === ECSRecordingActions.startRecording.type ? true : false)
      }
    }, [recordingActions])

    return null
  }
})
