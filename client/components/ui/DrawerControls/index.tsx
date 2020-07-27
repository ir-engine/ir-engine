import NavUserWidget from '../../../../../xrchat-client/components/ui/NavUserWidget'
import Router from 'next/router'
import Logo from '../../../../../xrchat-client/components/ui/Logo'
import './style.scss'
import {
    Forum,
    People,
    PersonAdd
} from '@material-ui/icons'
import {
    AppBar,
    Button
} from '@material-ui/core'

interface Props {
    setLeftDrawerOpen: any
    setTopDrawerOpen: any
    setRightDrawerOpen: any
    setBottomDrawerOpen: any
}

export const NavMenu = (props: Props) => {
  const homeNav = () => {
    Router.push('/')
  }
  const openChat = () => {
      props.setLeftDrawerOpen(false)
      props.setTopDrawerOpen(false)
      props.setRightDrawerOpen(false)
      props.setBottomDrawerOpen(true)
  }
  const openPeople = () => {
      props.setLeftDrawerOpen(true)
      props.setTopDrawerOpen(false)
      props.setRightDrawerOpen(false)
      props.setBottomDrawerOpen(false)
  }
  const openInvite = () => {
      props.setLeftDrawerOpen(false)
      props.setTopDrawerOpen(false)
      props.setRightDrawerOpen(true)
      props.setBottomDrawerOpen(false)
  }
  return (
    <AppBar className="bottom-appbar">
        <Button onClick={openInvite}>
            <PersonAdd />
        </Button>
        <Button onClick={openChat}>
            <Forum />
        </Button>
        <Button onClick={openPeople}>
            <People/>
        </Button>
    </AppBar>
  )
}

export default NavMenu
