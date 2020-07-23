import NavUserWidget from '../../../../../xrchat-client/components/ui/NavUserWidget'
import Router from 'next/router'
import Logo from '../../../../../xrchat-client/components/ui/Logo'
import './style.scss'
import {
    Forum,
    People
} from '@material-ui/icons'
import {
    AppBar,
    Button
} from '@material-ui/core'

interface Props {
    setLeftDrawerOpen: any
    setBottomDrawerOpen: any
}

export const NavMenu = (props: Props) => {
  const homeNav = () => {
    Router.push('/')
  }
  const openChat = () => {
      props.setLeftDrawerOpen(false)
      props.setBottomDrawerOpen(true)
  }
  const openPeople = () => {
    props.setLeftDrawerOpen(true)
    props.setBottomDrawerOpen(false)
  }
  return (
    <AppBar className="bottom-appbar">
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
