import { useState } from '@hookstate/core'
import { useChannelConnectionState } from '@xrengine/client-core/src/common/services/ChannelConnectionService'
import { accessMediaStreamState } from '@xrengine/client-core/src/media/services/MediaStreamService'
import { accessAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { useUserState } from '@xrengine/client-core/src/user/services/UserService'
import { User } from '@xrengine/common/src/interfaces/User'
import React, { useEffect } from 'react'
import PartyParticipantWindow from '../PartyParticipantWindow'

const PartyVideoWindows = (): JSX.Element => {
  const nearbyLayerUsers = useState(accessMediaStreamState().nearbyLayerUsers)
  const selfUserId = useState(accessAuthState().user.id)
  const userState = useUserState()
  const [displayedUsers, setDisplayedUsers] = React.useState([] as Array<User>)
  const channelConnectionState = useChannelConnectionState()

  useEffect(() => {
    if (channelConnectionState.channelType.value === 'channel') {
      setDisplayedUsers(userState.channelLayerUsers.value.filter((user) => user.id !== selfUserId.value))
    } else {
      setDisplayedUsers(
        userState.layerUsers.value.filter((user) => !!nearbyLayerUsers.value.find((u) => u.id === user.id))
      )
    }
  }, [nearbyLayerUsers.value.length])

  return (
    <>
      {displayedUsers.map((user) => (
        <PartyParticipantWindow peerId={user.id} key={user.id} />
      ))}
    </>
  )
}

export default PartyVideoWindows
