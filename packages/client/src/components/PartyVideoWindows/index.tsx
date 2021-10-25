import React, { useState, useEffect } from 'react'
import styles from './PartyVideoWindows.module.scss'
import PartyParticipantWindow from '../PartyParticipantWindow'
import { useAuthState } from '@xrengine/client-core/src/user/state/AuthState'
import { useUserState } from '@xrengine/client-core/src/user/state/UserState'
import { UserService } from '@xrengine/client-core/src/user/state/UserService'
import { useDispatch } from '@xrengine/client-core/src/store'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { State, Downgraded } from '@hookstate/core'
import { User } from '@xrengine/common/src/interfaces/User'
import { useMediaStreamState } from '@xrengine/client-core/src/media/state/MediaStreamState'

interface Props {}

const PartyVideoWindows = (props: Props): JSX.Element => {
  const mediaStreamState = useMediaStreamState()
  const dispatch = useDispatch()
  const userState = useUserState().attach(Downgraded).value

  const [displayedUsers, setDisplayedUsers] = useState([] as User[])
  const selfUser = useAuthState().user
  const nearbyLayerUsers = mediaStreamState.nearbyLayerUsers.value
  const layerUsers = userState.layerUsers
  const channelLayerUsers = userState.channelLayerUsers

  useEffect(() => {
    if (selfUser?.instanceId.value != null && userState.layerUsersUpdateNeeded === true) UserService.getLayerUsers(true)
    if (selfUser?.channelInstanceId.value != null && userState.channelLayerUsersUpdateNeeded === true)
      UserService.getLayerUsers(false)
  }, [selfUser?.instanceId.value, userState.layerUsersUpdateNeeded, userState.channelLayerUsersUpdateNeeded])

  useEffect(() => {
    if ((Network.instance?.transport as any)?.channelType === 'channel') {
      setDisplayedUsers(channelLayerUsers.filter((user) => user.id !== selfUser.id.value))
    } else {
      setDisplayedUsers(layerUsers.filter((user) => nearbyLayerUsers.includes(user.id)))
    }
  }, [layerUsers, channelLayerUsers])

  const [expanded, setExpanded] = useState(true)

  useEffect((() => {
    function handleResize() {
      if (window.innerWidth < 768) setExpanded(true)
    }

    window.addEventListener('resize', handleResize)

    return (_) => {
      window.removeEventListener('resize', handleResize)
    }
  }) as any)

  const toggleExpanded = () => setExpanded(!expanded)

  return (
    <>
      {displayedUsers.map((user) => (
        <PartyParticipantWindow peerId={user.id} key={user.id} />
      ))}
    </>
  )
}

export default PartyVideoWindows
