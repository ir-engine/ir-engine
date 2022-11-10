import { useHookstate, useState } from '@hookstate/core'
import React, { Fragment } from 'react'

import { useMediaInstanceConnectionState } from '@xrengine/client-core/src/common/services/MediaInstanceConnectionService'
import { useMediaStreamState } from '@xrengine/client-core/src/media/services/MediaStreamService'
import { accessAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { useNetworkUserState } from '@xrengine/client-core/src/user/services/NetworkUserService'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

import { ConsumerExtension, SocketWebRTCClientNetwork } from '../../transports/SocketWebRTCClientNetwork'
import { useShelfStyles } from '../Shelves/useShelfStyles'
import UserMediaWindow from '../UserMediaWindow'
import styles from './index.module.scss'

export const filterCamConsumerPairs = (network: SocketWebRTCClientNetwork, consumers: ConsumerExtension[]) => {
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

  const filteredConsumers = [] as ConsumerExtension[]

  // filter out pairs of cam video & cam audio
  consumers.map((consumer) => {
    const isUnique = !consumers.find(
      (u) =>
        consumer.appData.peerID === u.appData.peerID &&
        ((consumer.appData.mediaTag === 'cam-video' && u.appData.mediaTag === 'cam-audio') ||
          (consumer.appData.mediaTag === 'cam-audio' && u.appData.mediaTag === 'cam-video'))
    )
    if (isUnique && displayedUsers.includes(network.peers.get(consumer.appData.peerID)?.userId!))
      consumers.push(consumer)
  })

  return filteredConsumers
}

export const UserMediaWindows = () => {
  const mediaState = useMediaStreamState()
  const network = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork

  const consumers = filterCamConsumerPairs(network, mediaState.consumers.value)

  const { topShelfStyle } = useShelfStyles()

  return (
    <div className={`${styles.userMediaWindowsContainer} ${topShelfStyle}`}>
      <div className={styles.userMediaWindows}>
        {(mediaState.isScreenAudioEnabled.value || mediaState.isScreenVideoEnabled.value) && (
          <UserMediaWindow type={'screen'} peerID={network?.peerID} key={'screen_' + network?.peerID} />
        )}
        <UserMediaWindow type={'cam'} peerID={network?.peerID} key={'cam_' + network?.peerID} />
        {consumers.map((consumer) => {
          const peerID = consumer.appData.peerID
          const type = consumer.appData.mediaTag === 'screen-video' ? 'screen' : 'cam'
          return <UserMediaWindow type={type} peerID={peerID} key={type + '_' + peerID} />
        })}
      </div>
    </div>
  )
}
