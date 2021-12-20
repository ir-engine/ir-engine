import React, { useEffect } from 'react'
import styles from './PartyVideoWindows.module.scss'
import PartyParticipantWindow from '../PartyParticipantWindow'
import { accessMediaStreamState } from '@xrengine/client-core/src/media/services/MediaStreamService'
import { accessAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { useUserState } from '@xrengine/client-core/src/user/services/UserService'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { useState } from '@hookstate/core'
import { User } from '@xrengine/common/src/interfaces/User'
import { ClientTransportHandler } from '@xrengine/client-core/src/transports/SocketWebRTCClientTransport'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'

const PartyVideoWindows = (): JSX.Element => {
  const nearbyLayerUsers = useState(accessMediaStreamState().nearbyLayerUsers)
  const selfUserId = useState(accessAuthState().user.id)
  const userState = useUserState()
  const engineState = useEngineState()
  const [displayedUsers, setDisplayedUsers] = React.useState([] as Array<User>)

  useEffect(() => {
    if (engineState.joinedWorld.value) {
      if (
        (Network.instance.transportHandler as ClientTransportHandler).getMediaTransport()?.channelType === 'channel'
      ) {
        setDisplayedUsers(userState.channelLayerUsers.value.filter((user) => user.id !== selfUserId.value))
      } else {
        setDisplayedUsers(
          userState.layerUsers.value.filter((user) => !!nearbyLayerUsers.value.find((u) => u.id === user.id))
        )
      }
    }
  }, [engineState.joinedWorld.value, userState.channelLayerUsers.value.length, userState.layerUsers.value.length])

  return (
    <>
      {displayedUsers.map((user) => (
        <PartyParticipantWindow peerId={user.id} key={user.id} />
      ))}
    </>
  )
}

export default PartyVideoWindows
