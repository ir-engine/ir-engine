import { RecordingResult } from '@etherealengine/common/src/interfaces/Recording'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { ECSRecordingActions } from '@etherealengine/engine/src/ecs/ECSRecording'
import { ECSDeserializer, ECSSerialization, ECSSerializer } from '@etherealengine/engine/src/ecs/ECSSerializerSystem'
import { MotionCaptureCallbacks } from '@etherealengine/engine/src/mocap/MotionCaptureSystem'
import { readRigidBody, writeRigidBody } from '@etherealengine/engine/src/physics/PhysicsSerialization'
import { createActionQueue, dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'
import { Application } from '@etherealengine/server-core/declarations'
import { checkScope } from '@etherealengine/server-core/src/hooks/verify-scope'
import { ServerState } from '@etherealengine/server-core/src/ServerState'

import { getServerNetwork } from './SocketWebRTCServerFunctions'

export const getRecordingByID = (recordingID: string) => {
  /** @todo get recording metadata */
  return {} as any as {
    userID: UserId
  }
}

interface ActiveRecording {
  userID: UserId
  serializer?: ECSSerializer
  mediaRecorder?: any // todo
}

interface ActivePlayback {
  userID: UserId
  deserializer?: ECSDeserializer
  mediaPlayback?: any // todo
}

export const activeRecordings = new Map<string, ActiveRecording>()
export const activePlaybacks = new Map<string, ActivePlayback>()

export const dispatchError = (error: string, targetUser: UserId) => {
  const app = getState(ServerState).app as Application as Application
  dispatchAction(ECSRecordingActions.error({ error, $to: targetUser, $topic: getServerNetwork(app).topic }))
}

export const onStartRecording = async (action: ReturnType<typeof ECSRecordingActions.startRecording>) => {
  const app = getState(ServerState).app as Application as Application

  const recording = await app.service('recording').get(action.recordingID)
  if (!recording) return dispatchError('Recording not found', action.$from)

  const user = await app.service('user').get(recording.userId)
  if (!user) return dispatchError('Invalid user', action.$from)

  const userID = user.id

  const hasScopes = await checkScope(user, app, 'recording', 'write')
  if (!hasScopes) return dispatchError('User does not have record:write scope', userID)

  const activeRecording = {
    userID
  } as ActiveRecording

  if (Engine.instance.worldNetwork) {
    if (action.avatarPose) {
      activeRecording.serializer = ECSSerialization.createSerializer({
        entities: () => {
          return [Engine.instance.getUserAvatarEntity(userID)]
        },
        schema: [
          {
            read: readRigidBody,
            write: writeRigidBody
          }
        ],
        chunkLength: Engine.instance.tickRate * 60, // one minute
        onCommitChunk(chunk) {
          // upload chunk
        }
      })
    }

    if (action.mocap) {
      MotionCaptureCallbacks.set(userID, (buffer: ArrayBufferLike) => {
        // upload mocap frame
      })
    }
  }

  if (Engine.instance.mediaNetwork && action.video) {
    // start recording media
  }

  activeRecordings.set(recording.id, activeRecording)

  dispatchAction(
    ECSRecordingActions.recordingStarted({
      recordingID: recording.id,
      $to: userID,
      $topic: getServerNetwork(app).topic
    })
  )
}

export const onStopRecording = async (action: ReturnType<typeof ECSRecordingActions.stopRecording>) => {
  const app = getState(ServerState).app as Application

  const activeRecording = activeRecordings.get(action.recordingID)
  if (!activeRecording) return dispatchError('Recording not found', action.$from)

  const user = await app.service('user').get(activeRecording.userID)

  const hasScopes = await checkScope(user, app, 'recording', 'write')
  if (!hasScopes) return dispatchError('User does not have record:write scope', user.id)

  const recording = await app.service('recording').get(action.recordingID)

  if (activeRecording.serializer) {
    activeRecording.serializer.end()
  }
  if (activeRecording.mediaRecorder) {
    // stop recording media
  }
  activeRecordings.delete(action.recordingID)
}

export const onStartPlayback = async (action: ReturnType<typeof ECSRecordingActions.startPlayback>) => {
  const app = getState(ServerState).app as Application

  const recording = (await app.service('recording').get(action.recordingID)) as RecordingResult

  const user = await app.service('user').get(recording.userId)

  const hasScopes = await checkScope(user, app, 'recording', 'read')
  if (!hasScopes) return dispatchError('User does not have record:read scope', user.id)

  const activePlayback = {
    userID: action.targetUser
    // todo - playback
  } as ActiveRecording

  activePlaybacks.set(action.recordingID, activePlayback)
}

export const onStopPlayback = async (action: ReturnType<typeof ECSRecordingActions.stopPlayback>) => {
  const app = getState(ServerState).app as Application

  const recording = (await app.service('recording').get(action.recordingID)) as RecordingResult

  const user = await app.service('user').get(recording.userId)

  const hasScopes = await checkScope(user, app, 'recording', 'read')
  if (!hasScopes) throw new Error('User does not have record:read scope')

  const activePlayback = activePlaybacks.get(action.recordingID)
  if (!activePlayback) return

  if (activePlayback.deserializer) {
    activePlayback.deserializer.end()
  }

  if (MotionCaptureCallbacks.has(activePlayback.userID)) {
    MotionCaptureCallbacks.delete(activePlayback.userID)
  }

  if (activePlayback.mediaPlayback) {
    // stop recording media
  }

  activePlaybacks.delete(action.recordingID)

  await app.service('recording').patch(action.recordingID, { ended: true })
}

export default async function ServerRecordingSystem() {
  const startRecordingActionQueue = createActionQueue(ECSRecordingActions.startRecording.matches)
  const stopRecordingActionQueue = createActionQueue(ECSRecordingActions.stopRecording.matches)
  const startPlaybackActionQueue = createActionQueue(ECSRecordingActions.startPlayback.matches)
  const stopPlaybackActionQueue = createActionQueue(ECSRecordingActions.stopPlayback.matches)

  const execute = () => {
    for (const action of startRecordingActionQueue()) onStartRecording(action)
    for (const action of stopRecordingActionQueue()) onStopRecording(action)

    for (const action of startPlaybackActionQueue()) onStartPlayback(action)
    for (const action of stopPlaybackActionQueue()) onStopPlayback(action)
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
