import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { ECSRecordingActions } from '@etherealengine/engine/src/ecs/ECSRecording'
import { ECSDeserializer, ECSSerialization, ECSSerializer } from '@etherealengine/engine/src/ecs/ECSSerializerSystem'
import { readRigidBody, writeRigidBody } from '@etherealengine/engine/src/physics/PhysicsSerialization'
import { createActionQueue, getMutableState, getState } from '@etherealengine/hyperflux'
import { Application } from '@etherealengine/server-core/declarations'
import { checkScope } from '@etherealengine/server-core/src/hooks/verify-scope'
import { ServerState } from '@etherealengine/server-core/src/ServerState'

export const getRecordingByID = (recordingID: string) => {
  /** @todo get recording metadata */
  return {} as any as {
    userID: UserId
  }
}

interface ActiveRecording {
  userID: UserId
  serializer?: ECSSerializer
  mocapRecorder?: (buffer: ArrayBufferLike) => void
  mediaRecorder?: any // todo
}

interface ActivePlayback {
  userID: UserId
  deserializer?: ECSDeserializer
  mocapPlayback?: any // todo
  mediaPlayback?: any // todo
}

export const activeRecordings = new Map<string, ActiveRecording>()
export const activePlaybacks = new Map<string, ActivePlayback>()

export const onStartRecording = async (action: ReturnType<typeof ECSRecordingActions.startRecording>) => {
  const app = getMutableState(ServerState).app.value

  const user = await app.service('user').get(action.userID)

  const hasScopes = await checkScope(user, app, 'record', 'write')
  if (!hasScopes) throw new Error('User does not have record:write scope')

  const recording = await app.service('recording').create({ userID: action.userID })

  const activeRecording = {
    userID: action.userID
  } as ActiveRecording

  if (Engine.instance.worldNetwork) {
    if (action.avatarPose) {
      activeRecording.serializer = ECSSerialization.createSerializer({
        entities: () => {
          return [Engine.instance.getUserAvatarEntity(action.userID)]
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
      activeRecording.mocapRecorder = (buffer: ArrayBufferLike) => {
        // upload mocap frame
      }
    }
  }

  if (Engine.instance.mediaNetwork && action.video) {
    // start recording media
  }

  activeRecordings.set(recording.id, activeRecording)
}

export const onStopRecording = async (action: ReturnType<typeof ECSRecordingActions.stopRecording>) => {
  const app = getMutableState(ServerState).app.value

  const activeRecording = activeRecordings.get(action.recordingID)
  if (!activeRecording) return

  const user = await app.service('user').get(activeRecording.userID)

  const hasScopes = await checkScope(user, app, 'record', 'write')
  if (!hasScopes) throw new Error('User does not have record:write scope')

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
  const app = getMutableState(ServerState).app.value

  const recording = await app.service('recording').get(action.recordingID)

  const user = await app.service('user').get(recording.userID)

  const hasScopes = await checkScope(user, app, 'record', 'read')
  if (!hasScopes) throw new Error('User does not have record:read scope')

  const activePlayback = {
    userID: action.targetUser
    // todo - playback
  } as ActiveRecording

  activePlaybacks.set(action.recordingID, activePlayback)
}

export const onStopPlayback = async (action: ReturnType<typeof ECSRecordingActions.stopPlayback>) => {
  const app = getMutableState(ServerState).app.value

  const recording = await app.service('recording').get(action.recordingID)

  const user = await app.service('user').get(recording.userID)

  const hasScopes = await checkScope(user, app, 'record', 'read')
  if (!hasScopes) throw new Error('User does not have record:read scope')

  const activePlayback = activePlaybacks.get(action.recordingID)
  if (!activePlayback) return

  if (activePlayback.deserializer) {
    activePlayback.deserializer.end()
  }

  if (activePlayback.mocapPlayback) {
    // stop mocap playback
  }

  if (activePlayback.mediaPlayback) {
    // stop recording media
  }

  activePlaybacks.delete(action.recordingID)
}

export default async function ServerRecordingSystem() {
  const startRecordingActionQueue = createActionQueue(ECSRecordingActions.startRecording.matches)
  const stopRecordingActionQueue = createActionQueue(ECSRecordingActions.stopRecording.matches)
  const bufferReceivedActionQueue = createActionQueue(ECSRecordingActions.bufferReceived.matches)
  const startPlaybackActionQueue = createActionQueue(ECSRecordingActions.startPlayback.matches)
  const stopPlaybackActionQueue = createActionQueue(ECSRecordingActions.stopPlayback.matches)

  const execute = () => {
    for (const action of startRecordingActionQueue()) onStartRecording(action)
    for (const action of stopRecordingActionQueue()) onStopRecording(action)

    if (Engine.instance.worldNetwork) {
      const bufferReceived = bufferReceivedActionQueue()

      for (const recorder of activeRecordings.values()) {
        if (recorder.mocapRecorder) {
          for (const action of bufferReceived.filter((a) => a.userID === recorder.userID)) {
            recorder.mocapRecorder(action.buffer)
          }
        }
      }
    }

    for (const action of startPlaybackActionQueue()) onStartPlayback(action)
    for (const action of stopPlaybackActionQueue()) onStopPlayback(action)
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
