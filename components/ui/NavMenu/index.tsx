import NavItem from '../NavItem'
import React, { Component } from 'react'

import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import MenuIcon from '@material-ui/core/Icon'
import IconButton from '@material-ui/core/IconButton'

import { siteTitle } from '../../../config/server'

import './style.scss'

// TODO: Generate nav items from a config file

type Props = {}

class NavMenu extends Component {
  props: Props

  constructor(props: any) {
    super(props)
    this.props = props
  }

  render() {
    return (
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" color="inherit">
            {siteTitle}
          </Typography>
          <NavItem href="/" title="Home" text="Home" />
          <NavItem href="/settings" title="Settings" text="Settings" />
          <NavItem href="/admin" title="Admin" text="Admin" />
          <NavItem href="/login" title="Login" text="Login" />
        </Toolbar>
      </AppBar>
    )
  }
}
export default NavMenu
