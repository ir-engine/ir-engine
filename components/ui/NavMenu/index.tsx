import NavUserWidget from '../NavUserWidget'
import React, { Component } from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Logo from '../../../assets/logo.png'

import './style.scss'
import { logoutUser } from '../../../redux/auth/service'
import { selectAuthState } from '../../../redux/auth/selector'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import Button from '@material-ui/core/Button'
// TODO: Generate nav items from a config file

type Props = {
  auth: any
  logoutUser: typeof logoutUser
}

const mapStateToProps = (state: any) => {
  return {
    auth: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  logoutUser: bindActionCreators(logoutUser, dispatch)
})

class NavMenu extends Component<Props> {
  handleLogout() {
    console.log('logout')
    this.props.logoutUser()
  }

  render() {
    return (
      <AppBar className="appbar" position="sticky">
        <Toolbar className="toolbar">
          <div className="logo">
            <img
              src={Logo}
              alt="logo"
              crossOrigin="anonymous"
              className="logo"
            />
          </div>
          <NavUserWidget />
        </Toolbar>
      </AppBar>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NavMenu)
