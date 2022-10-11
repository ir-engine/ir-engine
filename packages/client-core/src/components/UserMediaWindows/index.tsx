import { useHookstate, useState } from '@hookstate/core'
import React, { Fragment } from 'react'

import { useMediaInstanceConnectionState } from '@xrengine/client-core/src/common/services/MediaInstanceConnectionService'
import { useMediaStreamState } from '@xrengine/client-core/src/media/services/MediaStreamService'
import { accessAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { useNetworkUserState } from '@xrengine/client-core/src/user/services/NetworkUserService'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

import { useShelfStyles } from '../Shelves/useShelfStyles'
import UserMediaWindow from '../UserMediaWindow'
import styles from './index.module.scss'

export const UserMediaWindows = () => {
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

  const consumers = mediaState.consumers.value
  const screenShareConsumers = consumers?.filter((consumer) => consumer.appData.mediaTag === 'screen-video') || []

  const { topShelfStyle } = useShelfStyles()

  return (
    <div className={`${styles.userMediaWindowsContainer} ${topShelfStyle}`}>
      <div className={styles.userMediaWindows}>
        {(mediaState.isScreenAudioEnabled.value || mediaState.isScreenVideoEnabled.value) && (
          <UserMediaWindow peerId={'screen_me'} key={'screen_me'} />
        )}
        <UserMediaWindow peerId={'cam_me'} key={'cam_me'} />
        {displayedUsers.map((user) => (
          <Fragment key={user.id}>
            <UserMediaWindow peerId={user.id} key={user.id} />
            {screenShareConsumers.find((consumer) => consumer.appData.peerId === user.id) && (
              <UserMediaWindow peerId={'screen_' + user.id} key={'screen_' + user.id} />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
