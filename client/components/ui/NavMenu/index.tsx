import NavUserWidget from '../NavUserWidget'
import AppBar from '@material-ui/core/AppBar'
import Router from 'next/router'
import Logo from '../Logo'
import './style.scss'

export const NavMenu = () => {
  const homeNav = () => {
    Router.push('/')
  }
  return (
    <AppBar className="appbar">
      <Logo onClick={homeNav} />
      <NavUserWidget />
    </AppBar>
  )
}

export default NavMenu
