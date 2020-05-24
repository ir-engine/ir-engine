import NavUserWidget from '../NavUserWidget'
import AppBar from '@material-ui/core/AppBar'
import Router from 'next/router'
import getConfig from 'next/config'

import './style.scss'

export const NavMenu = () => {
  const Logo = getConfig().publicRuntimeConfig.logo
  const homeNav = () => {
    Router.push('/')
  }
  return (
    <AppBar className="appbar">
      <div className="logo">
        <img
          src={Logo}
          alt="logo"
          crossOrigin="anonymous"
          className="logo"
          onClick={homeNav}
        />
      </div>
      <NavUserWidget />
    </AppBar>
  )
}

export default NavMenu
