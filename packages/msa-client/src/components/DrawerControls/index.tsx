import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Fab from '@material-ui/core/Fab'
import { Forum, People, PersonAdd } from '@material-ui/icons'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { useAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'
import { selectChatState } from '@xrengine/client-core/src/social/reducers/chat/selector'
import { updateMessageScrollInit } from '@xrengine/client-core/src/social/reducers/chat/service'
import { selectLocationState } from '@xrengine/client-core/src/social/reducers/location/selector'
import { selectPartyState } from '@xrengine/client-core/src/social/reducers/party/selector'
import styles from './DrawerControls.module.scss'

const mapStateToProps = (state: any): any => {
  return {
    chatState: selectChatState(state),
    locationState: selectLocationState(state),
    partyState: selectPartyState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateMessageScrollInit: bindActionCreators(updateMessageScrollInit, dispatch)
})

interface Props {
  disableBottom: boolean
  setLeftDrawerOpen: any
  setTopDrawerOpen: any
  setRightDrawerOpen: any
  setBottomDrawerOpen: any
  updateMessageScrollInit?: any
  chatState?: any
  locationState?: any
  partyState?: any
}

export const DrawerControls = (props: Props): JSX.Element => {
  const {
    disableBottom,
    locationState,
    partyState,
    setLeftDrawerOpen,
    setBottomDrawerOpen,
    setRightDrawerOpen,
    setTopDrawerOpen,
    updateMessageScrollInit
  } = props
  //const party = partyState.get('party')
  const selfUser = useAuthState().user
  //const currentLocation = locationState.get('currentLocation').get('location')
  //const enablePartyVideoChat = selfUser && selfUser.instanceId?.value != null && selfUser.partyId != null &&party?.id != null &&(Network?.instance?.transport as any)?.socket?.connected === true
  //const enableInstanceVideoChat = selfUser && selfUser.instanceId != null && currentLocation?.locationSettings?.instanceMediaChatEnabled === true && (Network?.instance?.transport as any)?.socket?.connected === true
  const openChat = (): void => {
    setLeftDrawerOpen(false)
    setTopDrawerOpen(false)
    setRightDrawerOpen(false)
    if (disableBottom !== true) setBottomDrawerOpen(true)
    setTimeout(() => updateMessageScrollInit(true), 100)
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
