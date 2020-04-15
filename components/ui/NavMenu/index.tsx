import NavUserWidget from '../NavUserWidget'
import React, { Component } from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import MenuIcon from '@material-ui/icons/Menu'
import IconButton from '@material-ui/core/IconButton'
import { siteTitle } from '../../../config/server'
import Logo from '../../../assets/logo.png'

import './style.scss'
import { logoutUser } from '../../../redux/auth/service'
import { selectAuthState } from '../../../redux/auth/selector'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button'
import './style.scss'

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
    const isLogined = this.props.auth.get('isLogined');
    const user = this.props.auth.get('user');
    const userName = user && user.user ? (user.user.name ?? user.user.email) : 'User';
    const avatarLetter = userName ? userName.substr(0, 1) : 'X';

    console.log('----------', isLogined, user);
    return (
      <AppBar position="sticky">
        <Toolbar>
          <div className="logo">
            <img
              src={Logo}
              alt="logo"
              crossOrigin="anonymous"
              className="logo"
            />
          </div>
          {/* TODO: MOVE TO NAVUSERWIDGTE */}
          {isLogined && 
          <div className="flex">
            <Button onClick={() => this.handleLogout()}>
              {userName}<br/>
              Logout
            </Button>
            {user && user.avatar ?
            <Avatar alt="User Avatar Icon" src={user.avatar} />
            :
            <Avatar alt="User Avatar">{avatarLetter}</Avatar>
            }
          </div>
          }
          {!isLogined && 
          <NavItem href="/auth/login" title="Login" text="Login" />}

          <NavUserWidget />
        </Toolbar>
      </AppBar>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NavMenu)
