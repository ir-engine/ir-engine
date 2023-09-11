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
import multiLogger from '@etherealengine/common/src/logger'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { ECSDeserializer, ECSSerialization, ECSSerializer } from '@etherealengine/engine/src/ecs/ECSSerializerSystem'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { Network, NetworkTopics } from '@etherealengine/engine/src/networking/classes/Network'
import { WorldNetworkAction } from '@etherealengine/engine/src/networking/functions/WorldNetworkAction'
import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { SerializationSchema } from '@etherealengine/engine/src/networking/serialization/Utils'
import {
  defineAction,
  defineActionQueue,
  defineState,
  dispatchAction,
  getState,
  Topic
} from '@etherealengine/hyperflux'

import { DataChannelType } from '@etherealengine/common/src/interfaces/DataChannelType'
import { AvatarNetworkAction } from '@etherealengine/engine/src/avatar/state/AvatarNetworkActions'
import { NetworkObjectComponent } from '@etherealengine/engine/src/networking/components/NetworkObjectComponent'
import { NetworkPeerFunctions } from '@etherealengine/engine/src/networking/functions/NetworkPeerFunctions'
import {
  addDataChannelHandler,
  DataChannelRegistryState,
  removeDataChannelHandler
} from '@etherealengine/engine/src/networking/systems/DataChannelRegistry'
import { updatePeers } from '@etherealengine/engine/src/networking/systems/OutgoingActionSystem'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import {
  RecordingID,
  recordingPath,
  RecordingSchemaType
} from '@etherealengine/engine/src/schemas/recording/recording.schema'
import { UserID, userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import matches, { Validator } from 'ts-matches'
import { checkScope } from '../common/functions/checkScope'
import { isClient } from '../common/functions/getEnvironment'
import { matchesUserId } from '../common/functions/MatchesUtils'

const logger = multiLogger.child({ component: 'engine:recording' })

export const startRecording = (args: { recordingID: RecordingID }) => {
  const { recordingID } = args
  const action = ECSRecordingActions.startRecording({
    recordingID
  })

  dispatchAction({
    ...action,
    $topic: NetworkTopics.world,
    $to: Engine.instance.worldNetwork.hostPeerID
  })

  dispatchAction({
    ...action,
    $topic: NetworkTopics.media,
    $to: Engine.instance.mediaNetwork.hostPeerID
  })
}

export const stopRecording = (args: { recordingID: RecordingID }) => {
  const recording = ECSRecordingActions.stopRecording({
    recordingID: args.recordingID
  })
  dispatchAction({
    ...recording,
    $topic: NetworkTopics.world,
    $to: Engine.instance.worldNetwork.hostPeerID
  })
  // todo - check that video actually needs to be stopped
  dispatchAction({
    ...recording,
    $topic: NetworkTopics.media,
    $to: Engine.instance.mediaNetwork.hostPeerID
  })
}

export const startPlayback = (args: { recordingID: RecordingID; targetUser?: UserID }) => {
  const { recordingID, targetUser } = args
  const action = ECSRecordingActions.startPlayback({
    recordingID,
    targetUser,
    autoplay: false
  })

  dispatchAction({
    ...action,
    $topic: NetworkTopics.world,
    $to: Engine.instance.worldNetwork.hostPeerID
  })

  dispatchAction({
    ...action,
    $topic: NetworkTopics.media,
    $to: Engine.instance.mediaNetwork.hostPeerID
  })
}

export const stopPlayback = (args: { recordingID: RecordingID }) => {
  const { recordingID } = args
  const action = ECSRecordingActions.stopPlayback({
    recordingID
  })

  dispatchAction({
    ...action,
    $topic: NetworkTopics.world,
    $to: Engine.instance.worldNetwork.hostPeerID
  })

  dispatchAction({
    ...action,
    $topic: NetworkTopics.media,
    $to: Engine.instance.mediaNetwork.hostPeerID
  })
}

export const ECSRecordingFunctions = {
  startRecording,
  stopRecording,
  startPlayback,
  stopPlayback
}

export class ECSRecordingActions {
  static startRecording = defineAction({
    type: 'ee.core.motioncapture.START_RECORDING' as const,
    recordingID: matches.string as Validator<unknown, RecordingID>
  })

  static recordingStarted = defineAction({
    type: 'ee.core.motioncapture.RECORDING_STARTED' as const,
    recordingID: matches.string as Validator<unknown, RecordingID>
  })

  static stopRecording = defineAction({
    type: 'ee.core.motioncapture.STOP_RECORDING' as const,
    recordingID: matches.string as Validator<unknown, RecordingID>
  })

  static startPlayback = defineAction({
    type: 'ee.core.motioncapture.PLAY_RECORDING' as const,
    recordingID: matches.string as Validator<unknown, RecordingID>,
    targetUser: matchesUserId.optional(),
    autoplay: matches.boolean
  })

  static playbackChanged = defineAction({
    type: 'ee.core.motioncapture.PLAYBACK_CHANGED' as const,
    recordingID: matches.string as Validator<unknown, RecordingID>,
    playing: matches.boolean
  })

  static stopPlayback = defineAction({
    type: 'ee.core.motioncapture.STOP_PLAYBACK' as const,
    recordingID: matches.string as Validator<unknown, RecordingID>
  })

  static error = defineAction({
    type: 'ee.core.motioncapture.ERROR' as const,
    error: matches.string
  })
}

interface ActiveRecording {
  userID: UserID
  serializer?: ECSSerializer
  dataChannelRecorder?: any // todo
  mediaChannelRecorder?: Awaited<ReturnType<MediaChannelRecorderType>>
}

interface ActivePlayback {
  userID: UserID
  deserializer?: ECSDeserializer
  entitiesSpawned: (EntityUUID | UserID)[]
  peerIDs?: PeerID[]
  mediaPlayback?: any // todo
}

export interface DataChannelFrame<T> {
  data: T[]
  timecode: number
}

export type MediaChannelRecorderType = (
  recordingID: RecordingID,
  schema: RecordingSchemaType['peers']
) => Promise<{
  recordings: Array<{
    stopRecording: () => void
    stream: PassThrough
    peerID: PeerID
    mediaType: 'webcam' | 'screenshare'
    format: string
  }>
  activeUploads: any[]
}>

export type UploadRecordingChunkType = (args: {
  recordingID: RecordingID
  key: string
  body: Buffer
  mimeType: string
}) => Promise<void>

export const RecordingAPIState = defineState({
  name: 'ee.engine.recording.RecordingAPIState',
  initial: {
    createMediaChannelRecorder: null as null | MediaChannelRecorderType,
    uploadRecordingChunk: null as null | UploadRecordingChunkType
  }
})

export const activeRecordings = new Map<RecordingID, ActiveRecording>()
export const activePlaybacks = new Map<RecordingID, ActivePlayback>()

export const dispatchError = (error: string, targetPeer: PeerID, topic: Topic) => {
  logger.error('Recording Error: ' + error)
  dispatchAction(ECSRecordingActions.error({ error, $to: targetPeer, $topic: topic }))
}

export const onStartRecording = async (action: ReturnType<typeof ECSRecordingActions.startRecording>) => {
  const api = Engine.instance.api

  const recording = await api.service(recordingPath).get(action.recordingID)
  if (!recording) return dispatchError('Recording not found', action.$peer, action.$topic)

  let schema = recording.schema

  if (typeof schema === 'string') {
    schema = JSON.parse(schema)
  }

  const user = await api.service(userPath).get(recording.userId)
  if (!user) return dispatchError('Invalid user', action.$peer, action.$topic)

  const userID = user.id

  const hasScopes = await checkScope(user, 'recording', 'write')
  if (!hasScopes) return dispatchError('User does not have record:write scope', action.$peer, action.$topic)

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

  const activeRecording = {
    userID,
    dataChannelRecorder
  } as ActiveRecording

  const uploadRecordingChunk = getState(RecordingAPIState).uploadRecordingChunk
  if (!uploadRecordingChunk)
    return dispatchError('Recording not available - no upload method provided', action.$peer, action.$topic)

  if (Engine.instance.worldNetwork) {
    const serializationSchema = schema.user
      .map((component) => getState(NetworkState).networkSchema[component] as SerializationSchema)
      .filter(Boolean)

    activeRecording.serializer = ECSSerialization.createSerializer({
      entities: () => {
        return [NetworkObjectComponent.getUserAvatarEntity(userID)]
      },
      schema: serializationSchema,
      chunkLength,
      onCommitChunk(chunk, chunkIndex) {
        const key = 'recordings/' + recording.id + '/entities-' + chunkIndex + '.ee'
        const buffer = encode(chunk)
        uploadRecordingChunk({
          recordingID: recording.id,
          key,
          body: buffer,
          mimeType: 'application/octet-stream'
        }).then(() => {
          logger.info('Uploaded entities chunk', chunkIndex)
        })

        for (const [dataChannel, data] of dataChannelsRecording.entries()) {
          if (data.length) {
            const key = 'recordings/' + recording.id + '/' + dataChannel + '-' + chunkIndex + '.ee'
            const buffer = encode(data)
            uploadRecordingChunk({
              recordingID: recording.id,
              key,
              body: buffer,
              mimeType: 'application/octet-stream'
            }).then(() => {
              logger.info('Uploaded raw chunk', chunkIndex)
            })
          }
          dataChannelsRecording.set(dataChannel, [])
        }
      }
    })

    activeRecording.serializer.active = true

    const dataChannelSchema = Object.values(schema.peers)
      .flat()
      .filter((component: DataChannelType) => !!getState(DataChannelRegistryState)[component])
      .filter(Boolean) as DataChannelType[]

    for (const dataChannel of dataChannelSchema) {
      addDataChannelHandler(dataChannel, dataChannelRecorder)
    }
  }

  if (Engine.instance.mediaNetwork) {
    const createMediaRecording = getState(RecordingAPIState).createMediaChannelRecorder
    if (!createMediaRecording) return dispatchError('Media recording not available', action.$peer, action.$topic)

    const mediaRecorder = await createMediaRecording(recording.id, schema.peers)

    activeRecording.mediaChannelRecorder = mediaRecorder
    console.log('media recording started')

    dispatchAction(
      ECSRecordingActions.recordingStarted({
        recordingID: recording.id,
        $to: action.$peer,
        $topic: action.$topic
      })
    )
  }

  activeRecordings.set(recording.id, activeRecording)
}

export const onStopRecording = async (action: ReturnType<typeof ECSRecordingActions.stopRecording>) => {
  const api = Engine.instance.api

  const activeRecording = activeRecordings.get(action.recordingID)
  if (!activeRecording) return dispatchError('Recording not found', action.$peer, action.$topic)

  const user = await api.service(userPath).get(activeRecording.userID)

  const hasScopes = await checkScope(user, 'recording', 'write')
  if (!hasScopes) return dispatchError('User does not have record:write scope', action.$peer, action.$topic)

  api.service(recordingPath).patch(action.recordingID, { ended: true }, { isInternal: true })

  const recording = await api.service(recordingPath).get(action.recordingID)

  let schema = recording.schema

  if (typeof schema === 'string') {
    schema = JSON.parse(schema)
  }

  if (activeRecording.serializer) {
    activeRecording.serializer.end()
  }

  if (activeRecording.mediaChannelRecorder) {
    await Promise.all([
      ...activeRecording.mediaChannelRecorder.recordings.map((recording) => recording.stopRecording()),
      ...activeRecording.mediaChannelRecorder.activeUploads
    ])
    // stop recording data channel
  }

  if (activeRecording.dataChannelRecorder) {
    const dataChannelSchema = Object.values(schema.peers)
      .flat()
      .filter((component: DataChannelType) => !!getState(DataChannelRegistryState)[component])
      .filter(Boolean) as DataChannelType[]

    for (const dataChannel of dataChannelSchema) {
      removeDataChannelHandler(dataChannel, activeRecording.dataChannelRecorder)
    }
  }
  activeRecordings.delete(action.recordingID)
}

export const onStartPlayback = async (action: ReturnType<typeof ECSRecordingActions.startPlayback>) => {
  const api = Engine.instance.api

  const recording = await api.service(recordingPath).get(action.recordingID, { isInternal: true })
  console.log(recording)

  let schema = recording.schema

  if (typeof schema === 'string') {
    schema = JSON.parse(schema)
  }

  const isClone = !action.targetUser

  const user = await api.service(userPath).get(recording.userId)
  if (!user) return dispatchError('User not found', action.$peer, action.$topic)

  if (!isClone && Array.from(activePlaybacks.values()).find((rec) => rec.userID === action.targetUser)) {
    return dispatchError('User already has an active playback', action.$peer, action.$topic)
  }

  const hasScopes = await checkScope(user, 'recording', 'read')
  if (!hasScopes) return dispatchError('User does not have record:read scope', action.$peer, action.$topic)

  if (!recording.resources?.length) return dispatchError('Recording has no resources', action.$peer, action.$topic)

  const activePlayback = {
    userID: action.targetUser
  } as ActivePlayback

  const entityFiles = recording.resources.filter((resource) => resource.key.includes('entities-'))

  const rawFiles = recording.resources.filter(
    (resource) =>
      !resource.key.includes('entities-') &&
      resource.key.substring(resource.key.length - 3, resource.key.length) === '.ee'
  )

  const mediaFiles = recording.resources.filter(
    (resource) => resource.key.substring(resource.key.length - 3, resource.key.length) !== '.ee'
  )

  const entityChunks = await Promise.all(
    entityFiles.map(async (resource) => {
      const data = await fetch(resource.url)
      const buffer = await data.arrayBuffer()
      return decode(new Uint8Array(buffer))
    })
  )

  const dataChannelChunks = new Map<DataChannelType, DataChannelFrame<any>[][]>()

  await Promise.all(
    rawFiles.map(async (resource) => {
      const dataChannel = resource.key.split('/')[2].split('-')[0] as DataChannelType
      if (!dataChannelChunks.has(dataChannel)) dataChannelChunks.set(dataChannel, [])
      const data = await fetch(resource.url)
      const buffer = await data.arrayBuffer()
      dataChannelChunks.get(dataChannel)!.push(decode(new Uint8Array(buffer)))
    })
  )

  const network = getState(NetworkState).networks[action.$network]

  const entitiesSpawned = [] as (EntityUUID | UserID)[]

  activePlayback.deserializer = ECSSerialization.createDeserializer({
    id: recording.id,
    chunks: entityChunks,
    schema: schema.user
      .map((component) => getState(NetworkState).networkSchema[component] as SerializationSchema)
      .filter(Boolean),
    onChunkStarted: (chunkIndex) => {
      if (entityChunks[chunkIndex])
        for (let i = 0; i < entityChunks[chunkIndex].entities.length; i++) {
          const uuid = entityChunks[chunkIndex].entities[i]
          // override entity ID such that it is actually unique, by appendig the recording id
          const entityID = isClone ? ((uuid + '_' + recording.id) as EntityUUID) : uuid
          entityChunks[chunkIndex].entities[i] = entityID
          api
            .service(userPath)
            .get(uuid)
            .then((user) => {
              if (network && network.topic === NetworkTopics.world) {
                const peerIDs = Object.keys(schema.peers) as PeerID[]

                // todo, this is a hack
                for (const peerID of peerIDs) {
                  if (network.peers[peerID]) continue
                  activePlayback.peerIDs!.push(peerID)
                  NetworkPeerFunctions.createPeer(
                    network,
                    peerID,
                    network.peerIndexCount++,
                    entityID,
                    network.userIndexCount++,
                    user.name + ' (Playback)'
                  )
                  updatePeers(network)
                }

                for (const [dataChannel, chunks] of Array.from(dataChannelChunks.entries())) {
                  const chunk = chunks[chunkIndex]
                  setDataChannelChunkToReplay(entityID, dataChannel, chunk)
                  // createOutgoingDataProducer(network, dataChannel)
                }
              }

              if (!UUIDComponent.entitiesByUUID[entityID]) {
                dispatchAction(
                  AvatarNetworkAction.spawn({
                    $from: entityID,
                    entityUUID: entityID
                  })
                )
                dispatchAction(
                  AvatarNetworkAction.setAvatarID({
                    $from: entityID,
                    avatarID: user.avatar.id!,
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
    },
    onEnd: () => {
      playbackStopped(activePlayback.userID, recording.id, network)
    }
  })

  activePlayback.deserializer.active = action.autoplay
  activePlayback.entitiesSpawned = entitiesSpawned

  activePlayback.peerIDs = []

  activePlaybacks.set(action.recordingID, activePlayback)

  /** We only need to dispatch once, so do it on the media server which takes longer to start */
  if (!network || network.topic === NetworkTopics.media) {
    dispatchAction(
      ECSRecordingActions.playbackChanged({
        recordingID: action.recordingID,
        playing: true,
        $topic: network?.topic
      })
    )
  }
}

export const onStopPlayback = async (action: ReturnType<typeof ECSRecordingActions.stopPlayback>) => {
  const api = Engine.instance.api

  const recording = await api.service(recordingPath).get(action.recordingID)

  let schema = recording.schema

  if (typeof schema === 'string') {
    schema = JSON.parse(schema)
  }

  const user = await api.service(userPath).get(recording.userId)

  const hasScopes = await checkScope(user, 'recording', 'read')
  if (!hasScopes) throw new Error('User does not have record:read scope')

  const activePlayback = activePlaybacks.get(action.recordingID)
  if (!activePlayback) return

  if (activePlayback.deserializer) {
    activePlayback.deserializer.end()
  }

  if (activePlayback.mediaPlayback) {
    /** @todo */
  }

  playbackStopped(user.id, recording.id, getState(NetworkState).networks[action.$network])
}

const playbackStopped = (userId: UserID, recordingID: RecordingID, network?: Network) => {
  const activePlayback = activePlaybacks.get(recordingID)!

  for (const entityUUID of activePlayback.entitiesSpawned) {
    dispatchAction(
      WorldNetworkAction.destroyObject({
        entityUUID: entityUUID as EntityUUID
      })
    )
  }

  removeDataChannelToReplay(userId)

  if (network) {
    if (activePlayback.peerIDs) {
      for (const peerID of activePlayback.peerIDs) {
        NetworkPeerFunctions.destroyPeer(network, peerID)
      }
    }

    updatePeers(network)

    /** If syncing multipile instance servers, only need to dispatch once, so do it on the world server */
    if (network.topic === NetworkTopics.world) {
      dispatchAction(
        ECSRecordingActions.playbackChanged({
          recordingID,
          playing: false,
          $topic: network.topic
        })
      )
    }
  }
  activePlaybacks.delete(recordingID)
}

export const dataChannelToReplay = new Map<
  UserID,
  Map<DataChannelType, { startTime: number; frames: DataChannelFrame<any>[] }>
>()

export const setDataChannelChunkToReplay = (
  userId: UserID,
  dataChannel: DataChannelType,
  frames: DataChannelFrame<any>[]
) => {
  if (!dataChannelToReplay.has(userId)) {
    dataChannelToReplay.set(userId, new Map())
  }

  const userMap = dataChannelToReplay.get(userId)!
  userMap.set(dataChannel, { startTime: Date.now(), frames })
}

export const removeDataChannelToReplay = (userId: UserID) => {
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
  // todo - client side recording
  if (!isClient) {
    for (const action of startRecordingActionQueue()) onStartRecording(action)
    for (const action of stopRecordingActionQueue()) onStopRecording(action)
  }

  for (const action of startPlaybackActionQueue()) onStartPlayback(action)
  for (const action of stopPlaybackActionQueue()) onStopPlayback(action)

  // todo - only set deserializer.active to true once avatar spawns, if clone mode

  const network = Engine.instance.worldNetwork // TODO - support buffer playback in media server

  if (!network) return

  for (const [userId, userMap] of Array.from(dataChannelToReplay.entries())) {
    if (network.users[userId])
      for (const [dataChannel, chunk] of userMap) {
        for (const frame of chunk.frames) {
          if (frame.timecode > Date.now() - chunk.startTime) {
            network.transport.bufferToAll(dataChannel, encode(frame.data))
            // for (const peerID of network.users[userId]) {
            //   network.transport.bufferToPeer(dataChannel, peerID, encode(frame.data))
            // }
            break
          }
        }
      }
  }
}

export const ECSRecordingSystem = defineSystem({
  uuid: 'ee.engine.ECSRecordingSystem',
  execute
})
