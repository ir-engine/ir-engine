import { useState } from '@hookstate/core'
import classNames from 'classnames'
import React from 'react'

import { useMediaInstanceConnectionState } from '@xrengine/client-core/src/common/services/MediaInstanceConnectionService'
import { useMediaStreamState } from '@xrengine/client-core/src/media/services/MediaStreamService'
import { accessAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { useNetworkUserState } from '@xrengine/client-core/src/user/services/NetworkUserService'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

import ConferenceModeParticipant from './ConferenceModeParticipant'
import styles from './index.module.scss'

const ConferenceMode = (): JSX.Element => {
  const mediaState = useMediaStreamState()
  const nearbyLayerUsers = mediaState.nearbyLayerUsers
  const selfUserId = useState(accessAuthState().user.id)
  const userState = useNetworkUserState()
  const channelConnectionState = useMediaInstanceConnectionState()
  const network = Engine.instance.currentWorld.mediaNetwork
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

    if (screenShareConsumers.find((consumer) => consumer.appData.peerId === user.id)) {
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
        <ConferenceModeParticipant peerId={'screen_me'} key={'screen_me'} />
      )}
      <ConferenceModeParticipant peerId={'cam_me'} key={'cam_me'} />
      {displayedUsers.map((user) => (
        <>
          <ConferenceModeParticipant peerId={user.id} key={user.id} />
          {screenShareConsumers.find((consumer) => consumer.appData.peerId === user.id) && (
            <ConferenceModeParticipant peerId={'screen_' + user.id} key={'screen_' + user.id} />
          )}
        </>
      ))}
    </div>
  )
}

export default ConferenceMode
