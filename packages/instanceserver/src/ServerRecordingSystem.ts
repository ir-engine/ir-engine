import { decode, encode } from 'msgpackr'

import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { RecordingResult } from '@etherealengine/common/src/interfaces/Recording'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import multiLogger from '@etherealengine/common/src/logger'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { ECSRecordingActions } from '@etherealengine/engine/src/ecs/ECSRecording'
import {
  ECSDeserializer,
  ECSSerialization,
  ECSSerializer,
  SerializedChunk
} from '@etherealengine/engine/src/ecs/ECSSerializerSystem'
import { DataChannelType, Network } from '@etherealengine/engine/src/networking/classes/Network'
import {
  addDataChannelHandler,
  dataChannelRegistry,
  NetworkState,
  removeDataChannelHandler,
  screenshareAudioDataChannelType,
  screenshareVideoDataChannelType,
  webcamAudioDataChannelType,
  webcamVideoDataChannelType
} from '@etherealengine/engine/src/networking/NetworkState'
import { SerializationSchema } from '@etherealengine/engine/src/networking/serialization/Utils'
import { createActionQueue, dispatchAction, getState, removeActionQueue } from '@etherealengine/hyperflux'
import { Application } from '@etherealengine/server-core/declarations'
import { checkScope } from '@etherealengine/server-core/src/hooks/verify-scope'
import { getStorageProvider } from '@etherealengine/server-core/src/media/storageprovider/storageprovider'
import { StorageObjectInterface } from '@etherealengine/server-core/src/media/storageprovider/storageprovider.interface'

import { getServerNetwork } from './SocketWebRTCServerFunctions'

const logger = multiLogger.child({ component: 'instanceserver:recording' })

interface ActiveRecording {
  userID: UserId
  serializer?: ECSSerializer
  dataChannelRecorder?: any // todo
  mediaChannelRecorder?: any // todo
}

interface ActivePlayback {
  userID: UserId
  deserializer?: ECSDeserializer
  mediaPlayback?: any // todo
}

export const activeRecordings = new Map<string, ActiveRecording>()
export const activePlaybacks = new Map<string, ActivePlayback>()

export const dispatchError = (error: string, targetUser: UserId) => {
  const app = Engine.instance.api as Application as Application
  dispatchAction(ECSRecordingActions.error({ error, $to: targetUser, $topic: getServerNetwork(app).topic }))
}

const mediaDataChannels = [
  webcamVideoDataChannelType,
  webcamAudioDataChannelType,
  screenshareVideoDataChannelType,
  screenshareAudioDataChannelType
]

export const onStartRecording = async (action: ReturnType<typeof ECSRecordingActions.startRecording>) => {
  const app = Engine.instance.api as Application as Application

  const recording = await app.service('recording').get(action.recordingID)
  if (!recording) return dispatchError('Recording not found', action.$from)

  const user = await app.service('user').get(recording.userId)
  if (!user) return dispatchError('Invalid user', action.$from)

  const userID = user.id

  const hasScopes = await checkScope(user, app, 'recording', 'write')
  if (!hasScopes) return dispatchError('User does not have record:write scope', userID)

  const storageProvider = getStorageProvider()

  /** create folder in storage provider */
  try {
    await storageProvider.putObject({ Key: 'recordings/' + recording.id } as StorageObjectInterface, {
      isDirectory: true
    })
  } catch (error) {
    return dispatchError('Could not create recording folder' + error.message, userID)
  }

  /** @todo - support multiple data channels for each user or peer */
  let rawDataChunks = [] as any[]
  let rawDataChunksCount = 0

  const chunkLength = Engine.instance.tickRate * 60 // 1 minute

  const dataChannelRecorder = (network: Network, dataChannel: DataChannelType, fromPeerID: PeerID, message: any) => {
    rawDataChunks.push(message)
  }

  const schema = JSON.parse(recording.schema) as string[]

  const activeRecording = {
    userID,
    dataChannelRecorder
  } as ActiveRecording

  if (Engine.instance.worldNetwork) {
    const serializationSchema = schema
      .map((component) => getState(NetworkState).networkSchema[component] as SerializationSchema)
      .filter(Boolean)

    if (serializationSchema.length) {
      activeRecording.serializer = ECSSerialization.createSerializer({
        entities: () => {
          return [Engine.instance.getUserAvatarEntity(userID)]
        },
        schema: serializationSchema,
        chunkLength,
        onCommitChunk(chunk, chunkIndex) {
          if (chunk.length) {
            storageProvider
              .putObject(
                {
                  Key: 'recordings/' + recording.id + '/entities-' + chunkIndex + '.bin',
                  Body: chunk,
                  ContentType: 'application/octet-stream'
                },
                {
                  isDirectory: false
                }
              )
              .then(() => {
                logger.info('Uploaded entities chunk', chunkIndex)
              })
          }

          if (rawDataChunks.length) {
            // todo - support more than one data channel
            // upload chunk to storage provider
            let count = rawDataChunksCount
            storageProvider
              .putObject(
                {
                  Key: 'recordings/' + recording.id + '/raw-' + rawDataChunksCount + '.bin',
                  Body: Buffer.concat(rawDataChunks),
                  ContentType: 'application/octet-stream'
                },
                {
                  isDirectory: false
                }
              )
              .then(() => {
                logger.info('Uploaded raw chunk', count)
              })

            rawDataChunks = []
            rawDataChunksCount++
          }
        }
      })
    }

    const dataChannelSchema = schema
      .filter((component: DataChannelType) => dataChannelRegistry.has(component))
      .filter(Boolean) as DataChannelType[]

    for (const dataChannel of dataChannelSchema) {
      addDataChannelHandler(dataChannel, dataChannelRecorder)
    }
  }

  if (Engine.instance.mediaNetwork) {
    const dataChannelSchema = schema
      .filter((component: DataChannelType) => mediaDataChannels.includes(component))
      .filter(Boolean)

    for (const dataChannel of dataChannelSchema) {
      // start recording data channel
    }
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
  const app = Engine.instance.api as Application

  const activeRecording = activeRecordings.get(action.recordingID)
  if (!activeRecording) return dispatchError('Recording not found', action.$from)

  const user = await app.service('user').get(activeRecording.userID)

  const hasScopes = await checkScope(user, app, 'recording', 'write')
  if (!hasScopes) return dispatchError('User does not have record:write scope', user.id)

  const recording = await app.service('recording').get(action.recordingID)

  const schema = JSON.parse(recording.schema) as string[]

  if (activeRecording.serializer) {
    activeRecording.serializer.end()
  }

  if (activeRecording.mediaChannelRecorder) {
    const dataChannelSchema = schema
      .filter((component: DataChannelType) => mediaDataChannels.includes(component))
      .filter(Boolean)

    // stop recording data channel
  }

  if (activeRecording.dataChannelRecorder) {
    const dataChannelSchema = schema
      .filter((component: DataChannelType) => dataChannelRegistry.has(component))
      .filter(Boolean) as DataChannelType[]

    for (const dataChannel of dataChannelSchema) {
      removeDataChannelHandler(dataChannel, activeRecording.dataChannelRecorder)
    }
  }
  activeRecordings.delete(action.recordingID)
}

export const onStartPlayback = async (action: ReturnType<typeof ECSRecordingActions.startPlayback>) => {
  const app = Engine.instance.api as Application

  const recording = (await app.service('recording').get(action.recordingID)) as RecordingResult

  const user = await app.service('user').get(recording.userId)

  const hasScopes = await checkScope(user, app, 'recording', 'read')
  if (!hasScopes) return dispatchError('User does not have record:read scope', user.id)

  const schema = JSON.parse(recording.schema) as string[]

  const activePlayback = {
    userID: action.targetUser
    // todo - playback
  } as ActivePlayback

  const chunks = [] as Buffer[] // todo populate data

  activePlayback.deserializer = ECSSerialization.createDeserializer(
    chunks,
    schema.map((component) => getState(NetworkState).networkSchema[component] as SerializationSchema).filter(Boolean)
  )

  activePlaybacks.set(action.recordingID, activePlayback)
}

export const onStopPlayback = async (action: ReturnType<typeof ECSRecordingActions.stopPlayback>) => {
  const app = Engine.instance.api as Application

  const recording = (await app.service('recording').get(action.recordingID)) as RecordingResult

  const user = await app.service('user').get(recording.userId)

  const hasScopes = await checkScope(user, app, 'recording', 'read')
  if (!hasScopes) throw new Error('User does not have record:read scope')

  const activePlayback = activePlaybacks.get(action.recordingID)
  if (!activePlayback) return

  if (activePlayback.deserializer) {
    activePlayback.deserializer.end()
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

  const cleanup = async () => {
    removeActionQueue(startRecordingActionQueue)
    removeActionQueue(stopRecordingActionQueue)
    removeActionQueue(startPlaybackActionQueue)
    removeActionQueue(stopPlaybackActionQueue)
  }

  return { execute, cleanup }
}
