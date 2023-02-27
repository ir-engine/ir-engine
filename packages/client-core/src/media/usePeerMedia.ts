import { useEffect } from 'react'

import { MediaTagType } from '@xrengine/common/src/interfaces/MediaStreamConstants'
import { PeerID } from '@xrengine/common/src/interfaces/PeerID'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getState, none, useHookstate } from '@xrengine/hyperflux'

import { MediaInstanceState } from '../common/services/MediaInstanceConnectionService'
import { createPeerMediaStream, PeerMediaStreamState, removePeerMediaStream } from '../transports/PeerMediaStreamState'
import { ConsumerExtension, SocketWebRTCClientNetwork } from '../transports/SocketWebRTCClientNetwork'
import { AuthState } from '../user/services/AuthService'
import { NetworkUserState } from '../user/services/NetworkUserService'
import { MediaState, useMediaStreamState } from './services/MediaStreamService'

export const filterWindows = (network: SocketWebRTCClientNetwork, consumers: ConsumerExtension[]) => {
  const mediaState = getState(MediaState)
  const nearbyLayerUsers = mediaState.nearbyLayerUsers
  const selfUserId = getState(AuthState).user.id
  const userState = getState(NetworkUserState)
  const channelConnectionState = getState(MediaInstanceState)
  const currentChannelInstanceConnection = network && channelConnectionState.instances[network.hostId].ornull

  const displayedUsers = (
    network?.hostId && currentChannelInstanceConnection
      ? currentChannelInstanceConnection.channelType?.value === 'party'
        ? userState.channelLayerUsers?.value.filter((user) => {
            return (
              user.id !== selfUserId.value &&
              user.channelInstanceId != null &&
              user.channelInstanceId === network?.hostId
            )
          }) || []
        : currentChannelInstanceConnection.channelType?.value === 'instance'
        ? userState.layerUsers.value.filter((user) => nearbyLayerUsers.value.includes(user.id))
        : []
      : []
  ).map((user) => user.id)

  const windows = [] as Array<{ peerID: PeerID; mediaTag?: MediaTagType }>

  /** always put own peer first */
  const selfPeerID = network?.peerID ?? 'self'
  if (mediaState.isScreenVideoEnabled.value) windows.push({ peerID: selfPeerID, mediaTag: 'screen-video' })
  if (mediaState.isScreenAudioEnabled.value) windows.push({ peerID: selfPeerID, mediaTag: 'screen-audio' })
  windows.push({ peerID: selfPeerID, mediaTag: 'cam-video' })
  windows.push({ peerID: selfPeerID, mediaTag: 'cam-audio' })

  // filter out pairs of cam video & cam audio
  consumers.forEach((consumer) => {
    const isUnique = !windows.find(
      (u) =>
        consumer.appData.peerID === u.peerID &&
        ((consumer.appData.mediaTag === 'cam-video' && u.mediaTag === 'cam-audio') ||
          (consumer.appData.mediaTag === 'cam-audio' && u.mediaTag === 'cam-video'))
    )
    if (isUnique && displayedUsers.includes(network.peers.get(consumer.appData.peerID)?.userId!))
      windows.push({ peerID: consumer.appData.peerID, mediaTag: consumer.appData.mediaTag })
  })

  // include a peer for each user without any consumers
  if (network)
    displayedUsers.forEach((userId) => {
      const peerID = Array.from(network.peers.values()).find((peer) => peer.userId === userId)?.peerID
      if (peerID && !windows.find((window) => window.peerID === peerID)) windows.push({ peerID })
    })

  return windows
}

export const usePeerMedia = () => {
  const mediaState = useMediaStreamState()
  const peerMediaStreamState = useHookstate(getState(PeerMediaStreamState))
  const network = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork

  useEffect(() => {
    const consumers = filterWindows(network, mediaState.consumers.get({ noproxy: true }))
    for (const consumer of consumers) {
      if (!peerMediaStreamState.value[consumer.peerID]) {
        createPeerMediaStream(consumer.peerID)
      }
    }

    for (const peerID of Object.keys(peerMediaStreamState.value)) {
      const peerConsumers = consumers.filter((consumer) => consumer.peerID === peerID)
      if (peerConsumers.length === 0) {
        removePeerMediaStream(peerID as PeerID)
      }
    }
  }, [mediaState.nearbyLayerUsers.length])
}
