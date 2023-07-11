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

import { decode, encode } from 'msgpackr'
import { PassThrough } from 'stream'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { RecordingResult } from '@etherealengine/common/src/interfaces/Recording'
import { StaticResourceInterface } from '@etherealengine/common/src/interfaces/StaticResourceInterface'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import multiLogger from '@etherealengine/common/src/logger'
import { AvatarNetworkAction } from '@etherealengine/engine/src/avatar/state/AvatarNetworkState'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { ECSRecordingActions } from '@etherealengine/engine/src/ecs/ECSRecording'
import { ECSDeserializer, ECSSerialization, ECSSerializer } from '@etherealengine/engine/src/ecs/ECSSerializerSystem'
import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { DataChannelType, Network } from '@etherealengine/engine/src/networking/classes/Network'
import { NetworkObjectComponent } from '@etherealengine/engine/src/networking/components/NetworkObjectComponent'
import { WorldNetworkAction } from '@etherealengine/engine/src/networking/functions/WorldNetworkAction'
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
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { defineActionQueue, dispatchAction, getState } from '@etherealengine/hyperflux'
import { Application } from '@etherealengine/server-core/declarations'
import { checkScope } from '@etherealengine/server-core/src/hooks/verify-scope'
import { getStorageProvider } from '@etherealengine/server-core/src/media/storageprovider/storageprovider'
import { StorageObjectInterface } from '@etherealengine/server-core/src/media/storageprovider/storageprovider.interface'
import { createStaticResourceHash } from '@etherealengine/server-core/src/media/upload-asset/upload-asset.service'

import { startMediaRecording } from './MediaRecordingFunctions'
import { getServerNetwork, SocketWebRTCServerNetwork } from './SocketWebRTCServerFunctions'
import { createOutgoingDataProducer } from './WebRTCFunctions'

const logger = multiLogger.child({ component: 'instanceserver:recording' })

interface ActiveRecording {
  userID: UserId
  serializer?: ECSSerializer
  dataChannelRecorder?: any // todo
  mediaChannelRecorder?: Awaited<ReturnType<typeof startMediaRecording>>
}

interface ActivePlayback {
  userID: UserId
  deserializer?: ECSDeserializer
  entitiesSpawned: (EntityUUID | UserId)[]
  mediaPlayback?: any // todo
}

interface DataChannelFrame<T> {
  data: T[]
  timecode: number
}

export const activeRecordings = new Map<string, ActiveRecording>()
export const activePlaybacks = new Map<string, ActivePlayback>()

export const dispatchError = (error: string, targetUser: UserId) => {
  const app = Engine.instance.api as Application
  logger.error('Recording Error: ' + error)
  dispatchAction(ECSRecordingActions.error({ error, $to: targetUser, $topic: getServerNetwork(app).topic }))
}

export const uploadRecordingStaticResource = async (props: {
  recordingID: string
  key: string
  body: Buffer | PassThrough
  mimeType: string
  hash: string
}) => {
  const app = Engine.instance.api as Application
  const storageProvider = getStorageProvider()

  const upload = await storageProvider.putObject({
    Key: props.key,
    Body: props.body,
    ContentType: props.mimeType
  })

  const staticResource = (await app.service('static-resource').create(
    {
      hash: props.hash,
      key: props.key,
      mimeType: props.mimeType
    },
    { isInternal: true }
  )) as StaticResourceInterface

  await app.service('recording-resource').create({
    staticResourceId: staticResource.id,
    recordingId: props.recordingID
  })

  return upload
}

const mediaDataChannels = [
  webcamVideoDataChannelType,
  webcamAudioDataChannelType,
  screenshareVideoDataChannelType,
  screenshareAudioDataChannelType
]

export const onStartRecording = async (action: ReturnType<typeof ECSRecordingActions.startRecording>) => {
  const app = Engine.instance.api as Application

  console.log('onStartRecording', action)

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

  const dataChannelsRecording = new Map<DataChannelType, DataChannelFrame<any>[]>()

  const startTime = Date.now()

  const chunkLength = Math.floor((1000 / getState(EngineState).simulationTimestep) * 60) // 1 minute

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
        const key = 'recordings/' + recording.id + '/entities-' + chunkIndex + '.ee'
        const buffer = encode(chunk)
        uploadRecordingStaticResource({
          recordingID: recording.id,
          key,
          body: buffer,
          mimeType: 'application/octet-stream',
          hash: createStaticResourceHash(buffer, { assetURL: key })
        }).then(() => {
          logger.info('Uploaded entities chunk', chunkIndex)
        })

        for (const [dataChannel, data] of dataChannelsRecording.entries()) {
          if (data.length) {
            const key = 'recordings/' + recording.id + '/' + dataChannel + '-' + chunkIndex + '.ee'
            const buffer = encode(data)
            uploadRecordingStaticResource({
              recordingID: recording.id,
              key,
              body: buffer,
              mimeType: 'application/octet-stream',
              hash: createStaticResourceHash(buffer, { assetURL: key })
            }).then(() => {
              logger.info('Uploaded raw chunk', chunkIndex)
            })
          }
          dataChannelsRecording.set(dataChannel, [])
        }
      }
    })

    activeRecording.serializer.active = true

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
      .filter(Boolean) as DataChannelType[]

    const mediaRecorder = await startMediaRecording(recording.id, userID, dataChannelSchema)

    activeRecording.mediaChannelRecorder = mediaRecorder
    console.log('media recording started')
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

    await Promise.all([
      ...activeRecording.mediaChannelRecorder.recordings.map((recording) => recording.stopRecording()),
      ...activeRecording.mediaChannelRecorder.activeUploads
    ])
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

  const recording = (await app.service('recording').get(action.recordingID, { internal: true })) as RecordingResult

  const isClone = !action.targetUser

  const user = await app.service('user').get(recording.userId)
  if (!user) return dispatchError('User not found', recording.userId)

  if (!isClone && Array.from(activePlaybacks.values()).find((rec) => rec.userID === action.targetUser)) {
    return dispatchError('User already has an active playback', action.targetUser!)
  }

  const hasScopes = await checkScope(user, app, 'recording', 'read')
  if (!hasScopes) return dispatchError('User does not have record:read scope', recording.userId)

  if (!recording.resources?.length) return dispatchError('Recording has no resources', recording.userId)

  const schema = JSON.parse(recording.schema) as string[]

  const activePlayback = {
    userID: action.targetUser
  } as ActivePlayback

  const storageProvider = getStorageProvider()

  const entityFiles = recording.resources.filter((key) => key.includes('entities-'))

  const rawFiles = recording.resources.filter(
    (key) => !key.includes('entities-') && key.substring(key.length - 3, key.length) === '.ee'
  )

  const mediaFiles = recording.resources.filter((key) => key.substring(key.length - 3, key.length) !== '.ee')

  const entityChunks = (await Promise.all(entityFiles.map((key) => storageProvider.getObject(key)))).map((data) =>
    decode(data.Body)
  )

  const dataChannelChunks = new Map<DataChannelType, DataChannelFrame<any>[][]>()

  await Promise.all(
    rawFiles.map(async (file) => {
      const dataChannel = file.split('/')[2].split('-')[0] as DataChannelType
      if (!dataChannelChunks.has(dataChannel)) dataChannelChunks.set(dataChannel, [])
      const data = await storageProvider.getObject(file)
      dataChannelChunks.get(dataChannel)!.push(decode(data.Body))
    })
  )

  const network = getServerNetwork(app) as SocketWebRTCServerNetwork

  const entitiesSpawned = [] as (EntityUUID | UserId)[]

  activePlayback.deserializer = ECSSerialization.createDeserializer({
    chunks: entityChunks,
    schema: schema
      .map((component) => getState(NetworkState).networkSchema[component] as SerializationSchema)
      .filter(Boolean),
    onChunkStarted: (chunkIndex) => {
      if (isClone) {
        if (entityChunks[chunkIndex] && Engine.instance.worldNetwork)
          for (let i = 0; i < entityChunks[chunkIndex].entities.length; i++) {
            const uuid = entityChunks[chunkIndex].entities[i]
            // override entity ID such that it is actually unique, by appendig the recording id
            const entityID = (uuid + '_' + recording.id) as EntityUUID
            entityChunks[chunkIndex].entities[i] = entityID
            if (!UUIDComponent.entitiesByUUID[entityID]) {
              app
                .service('user')
                .get(uuid)
                .then((user) => {
                  if (user && !UUIDComponent.entitiesByUUID[entityID]) {
                    dispatchAction(
                      AvatarNetworkAction.spawn({
                        entityUUID: entityID
                      })
                    )
                    dispatchAction(
                      AvatarNetworkAction.setAvatarID({
                        // $from: entityID,
                        avatarID: user.avatar.id,
                        entityUUID: entityID
                      })
                    )
                    entitiesSpawned.push(entityID)
                  }
                })
                .catch((e) => {
                  // console.log('not a user', e)
                })
            }
          }
      } else {
        for (const [dataChannel, chunks] of dataChannelChunks) {
          const chunk = chunks[chunkIndex]
          setDataChannelChunkToReplay(recording.userId, dataChannel, chunk)
          createOutgoingDataProducer(network, dataChannel)
        }
      }
    },
    onEnd: () => {
      playbackStopped(recording.userId, recording.id)
    }
  })

  // todo
  activePlayback.deserializer.active = true
  activePlayback.entitiesSpawned = entitiesSpawned

  activePlaybacks.set(action.recordingID, activePlayback)

  /** We only need to dispatch once, so do it on the world server */
  if (Engine.instance.worldNetwork) {
    dispatchAction(
      ECSRecordingActions.playbackChanged({
        recordingID: action.recordingID,
        playing: true,
        $topic: network.topic
      })
    )
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
  const app = Engine.instance.api as Application

  const activePlayback = activePlaybacks.get(recordingID)!

  for (const entityUUID of activePlayback.entitiesSpawned) {
    dispatchAction(
      WorldNetworkAction.destroyObject({
        entityUUID: entityUUID as EntityUUID
      })
    )
  }

  removeDataChannelToReplay(userId)

  activePlaybacks.delete(recordingID)

  /** We only need to dispatch once, so do it on the world server */
  if (Engine.instance.worldNetwork) {
    app.service('recording').patch(recordingID, { ended: true }, { isInternal: true })

    dispatchAction(
      ECSRecordingActions.playbackChanged({
        recordingID,
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

const startRecordingActionQueue = defineActionQueue(ECSRecordingActions.startRecording.matches)
const stopRecordingActionQueue = defineActionQueue(ECSRecordingActions.stopRecording.matches)
const startPlaybackActionQueue = defineActionQueue(ECSRecordingActions.startPlayback.matches)
const stopPlaybackActionQueue = defineActionQueue(ECSRecordingActions.stopPlayback.matches)

const execute = () => {
  for (const action of startRecordingActionQueue()) onStartRecording(action)
  for (const action of stopRecordingActionQueue()) onStopRecording(action)

  for (const action of startPlaybackActionQueue()) onStartPlayback(action)
  for (const action of stopPlaybackActionQueue()) onStopPlayback(action)

  // todo - only set deserializer.active to true once avatar spawns, if clone mode

  const app = Engine.instance.api as Application
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

export const ServerRecordingSystem = defineSystem({
  uuid: 'ee.engine.ServerRecordingSystem',
  execute
})
