import { useState } from '@hookstate/core'
import classNames from 'classnames'
import React from 'react'

import { MediaInstanceState } from '@etherealengine/client-core/src/common/services/MediaInstanceConnectionService'
import { MediaState } from '@etherealengine/client-core/src/media/services/MediaStreamService'
import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { NetworkUserState } from '@etherealengine/client-core/src/user/services/NetworkUserService'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import ConferenceModeParticipant from './ConferenceModeParticipant'
import styles from './index.module.scss'

const ConferenceMode = (): JSX.Element => {
  const mediaState = useHookstate(getMutableState(MediaState))
  const nearbyLayerUsers = mediaState.nearbyLayerUsers
  const selfUserId = useHookstate(getMutableState(AuthState).user.id)
  const userState = useHookstate(getMutableState(NetworkUserState))
  const channelConnectionState = useHookstate(getMutableState(MediaInstanceState))
  const network = Engine.instance.mediaNetwork
  const currentChannelInstanceConnection = network && channelConnectionState.instances[network.hostId].ornull
  const displayedUsers =
    network?.hostId && currentChannelInstanceConnection
      ? currentChannelInstanceConnection.channelType?.value === 'party'
        ? userState.layerUsers?.value.filter((user) => {
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

  const consumers = mediaState.consumers.value
  const screenShareConsumers = consumers?.filter((consumer) => consumer.appData.mediaTag === 'screen-video') || []

  let totalScreens = 1

  if (mediaState.isScreenAudioEnabled.value || mediaState.isScreenVideoEnabled.value) {
    totalScreens += 1
  }

  for (let user of displayedUsers) {
    totalScreens += 1
    const peerID = Array.from(network.peers.values()).find((peer) => peer.userId === user.id)?.peerID
    if (screenShareConsumers.find((consumer) => consumer.appData.peerID === peerID)) {
      totalScreens += 1
    }
  }

  return (
    <div
      className={classNames({
        [styles['participants']]: true,
        [styles['single-grid']]: totalScreens === 1,
        [styles['double-grid']]: totalScreens === 2 || totalScreens === 4,
        [styles['multi-grid']]: totalScreens === 3 || totalScreens > 4
      })}
    >
      {(mediaState.isScreenAudioEnabled.value || mediaState.isScreenVideoEnabled.value) && (
        <ConferenceModeParticipant type={'screen'} peerID={network.peerID} key={'screen_' + network.peerID} />
      )}
      <ConferenceModeParticipant type={'cam'} peerID={network.peerID} key={'cam_' + network.peerID} />
      {consumers.map((consumer) => {
        const peerID = consumer.appData.peerID
        const type = consumer.appData.mediaTag === 'screen-video' ? 'screen' : 'cam'
        return <ConferenceModeParticipant type={type} peerID={peerID} key={type + '_' + peerID} />
      })}
    </div>
  )
}

export default ConferenceMode
