import NavUserWidget from '../NavUserWidget'
import React, { Component } from 'react'
import AppBar from '@material-ui/core/AppBar'

import './style.scss'

import getConfig from 'next/config'
const Logo = getConfig().publicRuntimeConfig.logo

export default class NavMenu extends Component {
  render() {
    return (
      <AppBar className="appbar">
        <div className="logo">
          <img src={Logo} alt="logo" crossOrigin="anonymous" className="logo" />
        </div>
        <NavUserWidget />
      </AppBar>
    )
  }
}
