import React, { useState, useEffect } from 'react'
import styles from './PartyVideoWindows.module.scss'
import { ChevronRight } from '@material-ui/icons'
import PartyParticipantWindow from '../PartyParticipantWindow'
import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector'
import { selectMediastreamState } from '../../reducers/mediastream/selector'
import { useUserState } from '@xrengine/client-core/src/user/store/UserState'
import { UserService } from '@xrengine/client-core/src/user/store/UserService'
import { connect, useDispatch } from 'react-redux'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { bindActionCreators, Dispatch } from 'redux'
import { AnyNsRecord } from 'dns'
import { State, Downgraded } from '@hookstate/core'
import { User } from '@xrengine/common/src/interfaces/User'

interface Props {
  authState?: any
  mediaStreamState?: any
}

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state),
    mediaStreamState: selectMediastreamState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({})

const PartyVideoWindows = (props: Props): JSX.Element => {
  const { authState, mediaStreamState } = props

  const dispatch = useDispatch()
  const userState = useUserState().attach(Downgraded).value

  const [displayedUsers, setDisplayedUsers] = useState([] as User[])
  const selfUser = authState.get('user')
  const nearbyLayerUsers = mediaStreamState.get('nearbyLayerUsers') ?? []
  const layerUsers = userState.layerUsers
  const channelLayerUsers = userState.channelLayerUsers

  useEffect(() => {
    if (selfUser?.instanceId != null && userState.layerUsersUpdateNeeded === true)
      dispatch(UserService.getLayerUsers(true))
    if (selfUser?.channelInstanceId != null && userState.channelLayerUsersUpdateNeeded === true)
      dispatch(UserService.getLayerUsers(false))
  }, [selfUser, userState.layerUsersUpdateNeeded, userState.channelLayerUsersUpdateNeeded])

  useEffect(() => {
    if ((Network.instance?.transport as any)?.channelType === 'channel')
      setDisplayedUsers(channelLayerUsers.filter((user) => user.id !== selfUser.id))
    else setDisplayedUsers(layerUsers.filter((user) => nearbyLayerUsers.includes(user.id)))
  }, [layerUsers, channelLayerUsers, nearbyLayerUsers])

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
      <div className={styles.expandMenu}>
        Nearby
        <button type="button" className={expanded ? styles.expanded : ''} onClick={toggleExpanded}>
          <ChevronRight />
        </button>
      </div>
      {expanded && displayedUsers.map((user) => <PartyParticipantWindow peerId={user.id} key={user.id} />)}
    </>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(PartyVideoWindows)
