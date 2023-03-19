import { RecordingResult } from '@etherealengine/common/src/interfaces/Recording'
import { ECSRecordingActions } from '@etherealengine/engine/src/ecs/ECSRecording'
import { createActionQueue, defineState, getMutableState, removeActionQueue } from '@etherealengine/hyperflux'

import { API } from '../API'
import { NotificationService } from '../common/services/NotificationService'

export const RecordingState = defineState({
  name: 'RecordingState',
  initial: {
    started: false,
    recordingID: null as string | null
  }
})

export const RecordingFunctions = {
  startRecording: async () => {
    try {
      const recording = (await API.instance.client.service('recording').create()) as RecordingResult
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
      recordingState.set({
        started: true,
        recordingID: action.recordingID
      })
    }

    for (const action of startRecordingQueue()) {
      recordingState.started.set(true)
    }

    for (const action of stopRecordingQueue()) {
      recordingState.set({
        started: false,
        recordingID: null
      })
    }
  }

  const cleanup = async () => {
    removeActionQueue(recordingStartedQueue)
  }

  return { execute, cleanup }
}
