import NavUserWidget from '../NavUserWidget'
import React, { Component } from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Logo from '../../../assets/logo.png'
import './style.scss'

export default class NavMenu extends Component {
  render() {
    return (
      <AppBar className="appbar" position="sticky">
        <Toolbar>
          <div className="logo">
            <img
              src={Logo}
              alt="logo"
              crossOrigin="anonymous"
              className="logo"
            />
          </div>
          <div className="gap">&ngsp;</div>

          <NavUserWidget />
        </Toolbar>
      </AppBar>
    )
  }
}
