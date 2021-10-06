import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Fab from '@material-ui/core/Fab'
import { Forum, People, PersonAdd } from '@material-ui/icons'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { connect, useDispatch } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { useAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'
import { ChatService } from '@xrengine/client-core/src/social/reducers/chat/ChatService'
import styles from './DrawerControls.module.scss'

const mapStateToProps = (state: any): any => {
  return {}
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({})

interface Props {
  disableBottom: boolean
  setLeftDrawerOpen: any
  setTopDrawerOpen: any
  setRightDrawerOpen: any
  setBottomDrawerOpen: any
}

export const DrawerControls = (props: Props): JSX.Element => {
  const { disableBottom, setLeftDrawerOpen, setBottomDrawerOpen, setRightDrawerOpen, setTopDrawerOpen } = props
  const dispatch = useDispatch()
  const selfUser = useAuthState().user
  //const currentLocation = locationState.get('currentLocation').get('location')
  //const enablePartyVideoChat = selfUser && selfUser.instanceId?.value != null && selfUser.partyId != null &&party?.id != null &&(Network?.instance?.transport as any)?.socket?.connected === true
  //const enableInstanceVideoChat = selfUser && selfUser.instanceId != null && currentLocation?.locationSettings?.instanceMediaChatEnabled === true && (Network?.instance?.transport as any)?.socket?.connected === true
  const openChat = (): void => {
    setLeftDrawerOpen(false)
    setTopDrawerOpen(false)
    setRightDrawerOpen(false)
    if (disableBottom !== true) setBottomDrawerOpen(true)
    setTimeout(() => dispatch(ChatService.updateMessageScrollInit(true)), 100)
  }
  const openPeople = (): void => {
    setLeftDrawerOpen(true)
    setTopDrawerOpen(false)
    setRightDrawerOpen(false)
    if (disableBottom !== true) setBottomDrawerOpen(false)
  }
  const openInvite = (): void => {
    setLeftDrawerOpen(false)
    setTopDrawerOpen(false)
    setRightDrawerOpen(true)
    if (disableBottom !== true) setBottomDrawerOpen(false)
  }
  return (
    <AppBar className={styles['bottom-appbar']}>
      {selfUser.userRole.value !== 'guest' && (
        <Fab color="primary" aria-label="PersonAdd" onClick={openInvite}>
          <PersonAdd />
        </Fab>
      )}
      {selfUser.userRole.value !== 'guest' && disableBottom !== true && (
        <Fab color="primary" aria-label="Forum" onClick={openChat}>
          <Forum />
        </Fab>
      )}
      {selfUser.userRole.value !== 'guest' && (
        <Fab color="primary" aria-label="People" onClick={openPeople}>
          <People />
        </Fab>
      )}
    </AppBar>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(DrawerControls)
