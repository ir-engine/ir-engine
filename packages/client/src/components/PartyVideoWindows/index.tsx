import React, { useState, useEffect } from 'react'
import styles from './PartyVideoWindows.module.scss'
import PartyParticipantWindow from '../PartyParticipantWindow'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { useUserState } from '@xrengine/client-core/src/user/services/UserService'
import { UserService } from '@xrengine/client-core/src/user/services/UserService'
import { useDispatch } from '@xrengine/client-core/src/store'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { State, Downgraded } from '@hookstate/core'
import { User } from '@xrengine/common/src/interfaces/User'
import { useMediaStreamState } from '@xrengine/client-core/src/media/services/MediaStreamService'

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
    if ((Network.instance?.transport as any)?.channelType === 'channel') {
      setDisplayedUsers(channelLayerUsers.filter((user) => user.id !== selfUser.id.value))
    } else {
      setDisplayedUsers(layerUsers.filter((user) => nearbyLayerUsers.includes(user.id)))
    }
  }, [layerUsers, channelLayerUsers])

  // useEffect(() => {
  //   console.log('nearbyLayerUsers changed in PartyVideoWindows', nearbyLayerUsers, Array.isArray(nearbyLayerUsers))
  //   if ((Network.instance?.transport as any)?.channelType === 'instance') {
  //     // console.log('Updating displayed layer users', nearbyLayerUsers, layerUsers)
  //     // const nearbyClone =JSON.parse(JSON.stringify(nearbyLayerUsers))
  //     // console.log('nearbyClone', nearbyClone)
  //     const layerUserCopy = JSON.parse(JSON.stringify(layerUsers))
  //     console.log('layerUsers', layerUsers, 'layerUserCopy', layerUserCopy)
  //     const filtered = layerUserCopy
  //     console.log('filtered', filtered)
  //     // setDisplayedUsers(filtered)
  //     setDisplayedUsers(filtered)
  //   }
  // }, [nearbyLayerUsers])

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
