import React from 'react'
import styles from './PartyVideoWindows.module.scss'
import PartyParticipantWindow from '../PartyParticipantWindow'
import { accessMediaStreamState } from '@xrengine/client-core/src/media/services/MediaStreamService'
import { accessAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { useUserState } from '@xrengine/client-core/src/user/services/UserService'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { useState } from '@hookstate/core'
import { User } from '@xrengine/common/src/interfaces/User'

const PartyVideoWindows = (): JSX.Element => {
  const nearbyLayerUsers = useState(accessMediaStreamState().nearbyLayerUsers)
  const selfUserId = useState(accessAuthState().user.id)
  const userState = useUserState()

  let displayedUsers: Array<User>
  if ((Network.instance?.transport as any)?.channelType === 'channel') {
    displayedUsers = userState.channelLayerUsers.value.filter((user) => user.id !== selfUserId.value)
  } else {
    displayedUsers = userState.layerUsers.value.filter((user) => !!nearbyLayerUsers.value.find((u) => u.id === user.id))
  }

  return (
    <>
      {displayedUsers.map((user) => (
        <PartyParticipantWindow peerId={user.id} key={user.id} />
      ))}
    </>
  )
}

export default PartyVideoWindows
