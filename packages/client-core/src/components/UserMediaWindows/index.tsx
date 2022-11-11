import { useHookstate, useState } from '@hookstate/core'
import React, { Fragment } from 'react'

import { useMediaInstanceConnectionState } from '@xrengine/client-core/src/common/services/MediaInstanceConnectionService'
import { useMediaStreamState } from '@xrengine/client-core/src/media/services/MediaStreamService'
import { accessAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { useNetworkUserState } from '@xrengine/client-core/src/user/services/NetworkUserService'
import { MediaTagType } from '@xrengine/common/src/interfaces/MediaStreamConstants'
import { PeerID } from '@xrengine/common/src/interfaces/PeerID'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

import { ConsumerExtension, SocketWebRTCClientNetwork } from '../../transports/SocketWebRTCClientNetwork'
import { useShelfStyles } from '../Shelves/useShelfStyles'
import UserMediaWindow from '../UserMediaWindow'
import styles from './index.module.scss'

export const filterWindows = (network: SocketWebRTCClientNetwork, consumers: ConsumerExtension[]) => {
  const mediaState = useMediaStreamState()
  const nearbyLayerUsers = mediaState.nearbyLayerUsers
  const selfUserId = useState(accessAuthState().user.id)
  const userState = useNetworkUserState()
  const channelConnectionState = useMediaInstanceConnectionState()
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

export const UserMediaWindows = () => {
  const mediaState = useMediaStreamState()
  const network = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork

  const consumers = filterWindows(network, mediaState.consumers.get({ noproxy: true }))

  const { topShelfStyle } = useShelfStyles()

  return (
    <div className={`${styles.userMediaWindowsContainer} ${topShelfStyle}`}>
      <div className={styles.userMediaWindows}>
        {(mediaState.isScreenAudioEnabled.value || mediaState.isScreenVideoEnabled.value) && (
          <UserMediaWindow type={'screen'} peerID={network?.peerID} key={'screen_' + network?.peerID} />
        )}
        <UserMediaWindow type={'cam'} peerID={network?.peerID} key={'cam_' + network?.peerID} />
        {consumers.map(({ peerID, mediaTag }) => {
          const type = mediaTag === 'screen-video' ? 'screen' : 'cam'
          return <UserMediaWindow type={type} peerID={peerID} key={type + '_' + peerID} />
        })}
      </div>
    </div>
  )
}
