import NavItem from '../NavItem'
import React, { Component } from 'react'

import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import MenuIcon from '@material-ui/icons/Menu'
import IconButton from '@material-ui/core/IconButton'

import { siteTitle } from '../../../config/server'

import './style.scss'
import { logoutUser } from '../../../redux/auth/service'
import { selectAuthState } from '../../../redux/auth/selector'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import Button from '@material-ui/core/Button'
// TODO: Generate nav items from a config file


type Props = {
  auth: any,
  logoutUser: typeof logoutUser;
}

const mapStateToProps = (state: any) => {
  return {
    auth: selectAuthState(state),
  }
}
const mapDispatchToProps = (dispatch: Dispatch) => ({
  logoutUser: bindActionCreators(logoutUser, dispatch)
})

class NavMenu extends Component<Props> {
  handleLogout() {
    console.log('logout');
    this.props.logoutUser();
  }
  render() {
    return (
      <AppBar position="sticky">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <MenuIcon color="inherit" />
          </IconButton>
          <Typography variant="h6" color="inherit">
            {siteTitle}
          </Typography>
          <NavItem href="/" title="Home" text="Home" />
          <NavItem href="/settings" title="Settings" text="Settings" />
          <NavItem href="/admin" title="Admin" text="Admin" />
          <NavItem href="/auth/login" title="Login" text="Login" />
          <Button onClick={()=>this.handleLogout()}>Logout</Button>
        </Toolbar>
      </AppBar>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavMenu);
