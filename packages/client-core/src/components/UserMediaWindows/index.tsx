import { useState } from '@speigg/hookstate'
import React from 'react'

import { useMediaInstanceConnectionState } from '@xrengine/client-core/src/common/services/MediaInstanceConnectionService'
import {
  accessMediaStreamState,
  useMediaStreamState
} from '@xrengine/client-core/src/media/services/MediaStreamService'
import { accessAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { useUserState } from '@xrengine/client-core/src/user/services/UserService'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

import { usePartyState } from '../../social/services/PartyService'
import UserMediaWindow from '../UserMediaWindow'

const UserMediaWindows = (): JSX.Element => {
  const mediaState = useMediaStreamState()
  const nearbyLayerUsers = mediaState.nearbyLayerUsers
  const selfUserId = useState(accessAuthState().user.id)
  const userState = useUserState()
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

  console.log('displayedUsers', displayedUsers)

  const consumers = mediaState.consumers.value
  const screenShareConsumers = consumers?.filter((consumer) => consumer.appData.mediaTag === 'screen-video') || []

  return (
    <>
      {(mediaState.isScreenAudioEnabled.value || mediaState.isScreenVideoEnabled.value) && (
        <UserMediaWindow peerId={'screen_me'} key={'screen_me'} />
      )}
      <UserMediaWindow peerId={'cam_me'} key={'cam_me'} />
      {displayedUsers.map((user) => (
        <>
          <UserMediaWindow peerId={user.id} key={user.id} />
          {screenShareConsumers.find((consumer) => consumer.appData.peerId === user.id) && (
            <UserMediaWindow peerId={'screen_' + user.id} key={'screen_' + user.id} />
          )}
        </>
      ))}
    </>
  )
}

export default UserMediaWindows
