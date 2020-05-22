import NavUserWidget from '../NavUserWidget'
import React, { Component } from 'react'
import AppBar from '@material-ui/core/AppBar'
import Router from 'next/router'

import './style.scss'

import getConfig from 'next/config'
const Logo = getConfig().publicRuntimeConfig.logo

function homeNav() {
  Router.push('/')
}

export default class NavMenu extends Component {
  render() {
    return (
      <AppBar className="appbar">
        <div className="logo">
          <img src={Logo} alt="logo" crossOrigin="anonymous" className="logo"
            onClick={homeNav}/>
        </div>
        <NavUserWidget />
      </AppBar>
    )
  }
}
