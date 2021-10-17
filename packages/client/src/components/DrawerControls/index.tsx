import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Fab from '@material-ui/core/Fab'
import { Forum, People, PersonAdd } from '@material-ui/icons'
import { useDispatch } from '@xrengine/client-core/src/store'
import { useAuthState } from '@xrengine/client-core/src/user/state/AuthState'
import { ChatService } from '@xrengine/client-core/src/social/state/ChatService'
import styles from './DrawerControls.module.scss'

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
    setTimeout(() => ChatService.updateMessageScrollInit(true), 100)
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

export default DrawerControls
