import NavUserWidget from '../NavUserWidget'
import React, { Component } from 'react'
import AppBar from '@material-ui/core/AppBar'

import Logo from '../../../assets/logo.png'
import './style.scss'

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
