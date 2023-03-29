import { RecordingResult } from '@etherealengine/common/src/interfaces/Recording'
import { IKSerialization } from '@etherealengine/engine/src/avatar/IKSerialization'
import { ECSRecordingActions } from '@etherealengine/engine/src/ecs/ECSRecording'
import { mocapDataChannelType } from '@etherealengine/engine/src/mocap/MotionCaptureSystem'
import { webcamVideoDataChannelType } from '@etherealengine/engine/src/networking/NetworkState'
import { PhysicsSerialization } from '@etherealengine/engine/src/physics/PhysicsSerialization'
import { createActionQueue, defineState, getMutableState, getState, removeActionQueue } from '@etherealengine/hyperflux'

import { API } from '../API'
import { NotificationService } from '../common/services/NotificationService'

export const RecordingState = defineState({
  name: 'RecordingState',
  initial: {
    started: false,
    recordingID: null as string | null,
    config: {
      mocap: true,
      video: true,
      pose: true
    }
  }
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
        schema.push(IKSerialization.headID)
        schema.push(IKSerialization.leftHandID)
        schema.push(IKSerialization.rightHandID)
        schema.push(mocapDataChannelType)
      }
      if (state.config.video) {
        schema.push(webcamVideoDataChannelType)
      }
      const recording = (await API.instance.client.service('recording').create({
        schema: JSON.stringify(schema)
      })) as RecordingResult
      return recording.id
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export async function RecordingStateReceptorSystem() {
  const recordingState = getMutableState(RecordingState)

  const startRecordingQueue = createActionQueue(ECSRecordingActions.startRecording.matches)
  const recordingStartedQueue = createActionQueue(ECSRecordingActions.recordingStarted.matches)
  const stopRecordingQueue = createActionQueue(ECSRecordingActions.stopRecording.matches)

  const execute = () => {
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
  }

  const cleanup = async () => {
    removeActionQueue(recordingStartedQueue)
  }

  return { execute, cleanup }
}
