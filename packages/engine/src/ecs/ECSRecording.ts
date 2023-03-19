import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { defineAction, dispatchAction } from '@etherealengine/hyperflux'

import { matches, matchesUserId, Validator } from '../common/functions/MatchesUtils'
import { NetworkTopics } from '../networking/classes/Network'

export const startRecording = (args: { userID: UserId; mocap: boolean; video: boolean; avatarPose: boolean }) => {
  const { userID, mocap, video, avatarPose } = args
  const action = ECSRecordingActions.startRecording({
    userID,
    mocap,
    video,
    avatarPose
  })

  dispatchAction({
    ...action,
    $topic: NetworkTopics.world
  })

  if (video) {
    dispatchAction({
      ...action,
      $topic: NetworkTopics.media
    })
  }
}

export const stopRecording = (recordingID: string) => {
  dispatchAction({
    ...ECSRecordingActions.stopRecording({
      recordingID
    }),
    $topic: NetworkTopics.world
  })
}

export const ECSRecordingFunctions = {
  startRecording,
  stopRecording
}

export class ECSRecordingActions {
  static startRecording = defineAction({
    type: 'ee.core.motioncapture.START_RECORDING' as const,
    userID: matchesUserId,
    mocap: matches.boolean,
    video: matches.boolean,
    avatarPose: matches.boolean
  })

  static stopRecording = defineAction({
    type: 'ee.core.motioncapture.STOP_RECORDING' as const,
    recordingID: matches.string
  })

  static bufferReceived = defineAction({
    type: 'ee.core.motioncapture.BUFFER_RECEIVED' as const,
    userID: matchesUserId,
    buffer: matches.any as Validator<unknown, ArrayBufferLike>
  })

  static startPlayback = defineAction({
    type: 'ee.core.motioncapture.PLAY_RECORDING' as const,
    recordingID: matches.string,
    targetUser: matchesUserId
  })

  static stopPlayback = defineAction({
    type: 'ee.core.motioncapture.STOP_PLAYBACK' as const,
    recordingID: matches.string,
    targetUser: matchesUserId
  })
}
