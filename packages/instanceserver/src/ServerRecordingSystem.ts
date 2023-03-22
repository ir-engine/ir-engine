import { decode, encode } from 'msgpackr'

import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { RecordingResult } from '@etherealengine/common/src/interfaces/Recording'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import multiLogger from '@etherealengine/common/src/logger'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { ECSRecordingActions } from '@etherealengine/engine/src/ecs/ECSRecording'
import { ECSDeserializer, ECSSerialization, ECSSerializer } from '@etherealengine/engine/src/ecs/ECSSerializerSystem'
import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { DataChannelType, Network } from '@etherealengine/engine/src/networking/classes/Network'
import { NetworkObjectComponent } from '@etherealengine/engine/src/networking/components/NetworkObjectComponent'
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

import { getServerNetwork, SocketWebRTCServerNetwork } from './SocketWebRTCServerFunctions'
import { createOutgoingDataProducer } from './WebRTCFunctions'

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

interface DataChannelFrame<T> {
  data: T[]
  timecode: number
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

  if (activeRecordings.has(userID)) return dispatchError('User is already recording', userID)

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

  const dataChannelsRecording = new Map<DataChannelType, DataChannelFrame<any>[]>()

  const startTime = Date.now()

  const chunkLength = Engine.instance.tickRate * 60 // 1 minute

  const dataChannelRecorder = (network: Network, dataChannel: DataChannelType, fromPeerID: PeerID, message: any) => {
    try {
      const data = decode(new Uint8Array(message))
      if (!dataChannelsRecording.has(dataChannel)) {
        dataChannelsRecording.set(dataChannel, [])
      }
      dataChannelsRecording.get(dataChannel)!.push({ data, timecode: Date.now() - startTime })
    } catch (error) {
      logger.error('Could not decode data channel message', error)
    }
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

    activeRecording.serializer = ECSSerialization.createSerializer({
      entities: () => {
        return [Engine.instance.getUserAvatarEntity(userID)]
      },
      schema: serializationSchema,
      chunkLength,
      onCommitChunk(chunk, chunkIndex) {
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

        for (const [dataChannel, data] of dataChannelsRecording.entries()) {
          if (data.length) {
            let count = chunkIndex
            storageProvider
              .putObject(
                {
                  Key: 'recordings/' + recording.id + '/' + dataChannel + '-' + chunkIndex + '.bin',
                  Body: encode(data),
                  ContentType: 'application/octet-stream'
                },
                {
                  isDirectory: false
                }
              )
              .then(() => {
                logger.info('Uploaded raw chunk', count)
              })
          }
          dataChannelsRecording.set(dataChannel, [])
        }
      }
    })

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
      /** @todo */
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
  if (!user) return dispatchError('User not found', recording.userId)

  if (activePlaybacks.has(action.targetUser)) {
    return dispatchError('User already has an active playback', action.targetUser)
  }

  const hasScopes = await checkScope(user, app, 'recording', 'read')
  if (!hasScopes) return dispatchError('User does not have record:read scope', user.id)

  const schema = JSON.parse(recording.schema) as string[]

  const activePlayback = {
    userID: action.targetUser
  } as ActivePlayback

  const storageProvider = getStorageProvider()

  const files = await storageProvider.listObjects('recordings/' + action.recordingID + '/', true)

  const entityFiles = files.Contents.filter((file) => file.Key.includes('entities-'))

  const rawFiles = files.Contents.filter((file) => !file.Key.includes('entities-'))

  const entityChunks = (await Promise.all(entityFiles.map((file) => storageProvider.getObject(file.Key)))).map(
    (data) => data.Body
  )

  const dataChannelChunks = new Map<DataChannelType, DataChannelFrame<any>[][]>()

  await Promise.all(
    rawFiles.map(async (file) => {
      const dataChannel = file.Key.split('/')[2].split('-')[0] as DataChannelType
      if (!dataChannelChunks.has(dataChannel)) dataChannelChunks.set(dataChannel, [])
      const data = await storageProvider.getObject(file.Key)
      dataChannelChunks.get(dataChannel)!.push(decode(data.Body))
    })
  )

  const network = getServerNetwork(app) as SocketWebRTCServerNetwork

  activePlayback.deserializer = ECSSerialization.createDeserializer({
    chunks: entityChunks,
    schema: schema
      .map((component) => getState(NetworkState).networkSchema[component] as SerializationSchema)
      .filter(Boolean),
    onChunkStarted: (chunkIndex) => {
      for (const [dataChannel, chunks] of dataChannelChunks) {
        const chunk = chunks[chunkIndex]
        setDataChannelChunkToReplay(user.id, dataChannel, chunk)
        createOutgoingDataProducer(network, dataChannel)
      }
    },
    onEnd: () => {
      playbackStopped(user.id, recording.id)
    }
  })

  activePlaybacks.set(action.recordingID, activePlayback)

  /** We only need to dispatch once, so do it on the world server */
  if (Engine.instance.worldNetwork) {
    dispatchAction(
      ECSRecordingActions.playbackChanged({
        recordingID: action.recordingID,
        targetUser: action.targetUser,
        playing: true,
        $topic: network.topic
      })
    )

    /** Take control of avatar while avatar is live */
    /** @todo, how do we  */

    // const targetEntity = Engine.instance.getUserAvatarEntity(user.id)
    // if (!targetEntity) return

    // const networkObject = getComponent(targetEntity, NetworkObjectComponent)
    // dispatchAction(
    //   WorldNetworkAction.transferAuthorityOfObject({
    //     ownerId: networkObject.ownerId,
    //     networkId: networkObject.networkId,
    //     newAuthority: Engine.instance.worldNetwork?.peerID
    //   })
    // )
    // setComponent(controlledEntity, NetworkObjectAuthorityTag)
  }
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
    /** @todo */
  }

  playbackStopped(user.id, recording.id)
}

const playbackStopped = (userId: UserId, recordingID: string) => {
  const app = getState(ServerState).app as Application

  removeDataChannelToReplay(userId)

  activePlaybacks.delete(recordingID)

  /** We only need to dispatch once, so do it on the world server */
  if (Engine.instance.worldNetwork) {
    app.service('recording').patch(recordingID, { ended: true }, { isInternal: true })

    dispatchAction(
      ECSRecordingActions.playbackChanged({
        recordingID,
        targetUser: userId,
        playing: false,
        $topic: getServerNetwork(app).topic
      })
    )
  }
}

export const dataChannelToReplay = new Map<
  UserId,
  Map<DataChannelType, { startTime: number; frames: DataChannelFrame<any>[] }>
>()

export const setDataChannelChunkToReplay = (
  userId: UserId,
  dataChannel: DataChannelType,
  frames: DataChannelFrame<any>[]
) => {
  if (!dataChannelToReplay.has(userId)) {
    dataChannelToReplay.set(userId, new Map())
  }

  const userMap = dataChannelToReplay.get(userId)!
  userMap.set(dataChannel, { startTime: Date.now(), frames })
}

export const removeDataChannelToReplay = (userId: UserId) => {
  if (!dataChannelToReplay.has(userId)) {
    return
  }

  dataChannelToReplay.delete(userId)
}

export default async function ServerRecordingSystem() {
  const startRecordingActionQueue = createActionQueue(ECSRecordingActions.startRecording.matches)
  const stopRecordingActionQueue = createActionQueue(ECSRecordingActions.stopRecording.matches)
  const startPlaybackActionQueue = createActionQueue(ECSRecordingActions.startPlayback.matches)
  const stopPlaybackActionQueue = createActionQueue(ECSRecordingActions.stopPlayback.matches)

  const app = getState(ServerState).app as Application

  const execute = () => {
    for (const action of startRecordingActionQueue()) onStartRecording(action)
    for (const action of stopRecordingActionQueue()) onStopRecording(action)

    for (const action of startPlaybackActionQueue()) onStartPlayback(action)
    for (const action of stopPlaybackActionQueue()) onStopPlayback(action)

    const network = getServerNetwork(app)

    for (const [userId, userMap] of dataChannelToReplay) {
      if (network.users.has(userId))
        for (const [dataChannel, chunk] of userMap) {
          for (const frame of chunk.frames) {
            if (frame.timecode > Date.now() - chunk.startTime) {
              network.transport.bufferToAll(dataChannel, encode(frame.data))
              // for (const peerID of network.users.get(userId)!) {
              //   network.transport.bufferToPeer(dataChannel, peerID, encode(frame.data))
              // }
              break
            }
          }
        }
    }
  }

  const cleanup = async () => {
    removeActionQueue(startRecordingActionQueue)
    removeActionQueue(stopRecordingActionQueue)
    removeActionQueue(startPlaybackActionQueue)
    removeActionQueue(stopPlaybackActionQueue)
  }

  return { execute, cleanup }
}
