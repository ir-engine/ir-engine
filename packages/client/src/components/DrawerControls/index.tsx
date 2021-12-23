import React from 'react'
import AppBar from '@mui/material/AppBar'
import Fab from '@mui/material/Fab'
import { Forum, People, PersonAdd } from '@mui/icons-material'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { ChatService } from '@xrengine/client-core/src/social/services/ChatService'
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
  const selfUser = useAuthState().user
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
