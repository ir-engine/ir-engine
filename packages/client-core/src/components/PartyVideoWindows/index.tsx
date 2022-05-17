import { useState } from '@speigg/hookstate'
import React, { useEffect } from 'react'

import { useMediaInstanceConnectionState } from '@xrengine/client-core/src/common/services/MediaInstanceConnectionService'
import { accessMediaStreamState } from '@xrengine/client-core/src/media/services/MediaStreamService'
import { accessAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { useUserState } from '@xrengine/client-core/src/user/services/UserService'
import { User } from '@xrengine/common/src/interfaces/User'

import PartyParticipantWindow from '../PartyParticipantWindow'

const PartyVideoWindows = (): JSX.Element => {
  const nearbyLayerUsers = useState(accessMediaStreamState().nearbyLayerUsers)
  const selfUserId = useState(accessAuthState().user.id)
  const userState = useUserState()
  const channelConnectionState = useMediaInstanceConnectionState()
  const currentChannelInstanceId = channelConnectionState.currentInstanceId.value
  const currentChannelInstanceConnection = channelConnectionState.instances[currentChannelInstanceId!].ornull
  const displayedUsers = currentChannelInstanceId
    ? currentChannelInstanceConnection.channelType.value === 'channel'
      ? userState.channelLayerUsers.value.filter((user) => user.id !== selfUserId.value)
      : userState.layerUsers.value.filter((user) => !!nearbyLayerUsers.value.find((u) => u.id === user.id))
    : []

  return (
    <>
      {displayedUsers.map((user) => (
        <PartyParticipantWindow peerId={user.id} key={user.id} />
      ))}
    </>
  )
}

export default PartyVideoWindows
