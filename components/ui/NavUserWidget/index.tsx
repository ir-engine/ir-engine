import Link from '@material-ui/core/Typography'
import NextLink from 'next/link'
import React, { Component } from 'react'
import Button from '@material-ui/core/Button'

import './style.scss'

import { logoutUser } from '../../../redux/auth/service'
import { selectAuthState } from '../../../redux/auth/selector'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import Avatar from '@material-ui/core/Avatar'

// Get auth state from redux
// Get user email address
// If not logged in, show login
// If logged in, show email address and user icon

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

class NavUserBadge extends Component<Props> {
  handleLogout() {
    console.log('logout')
    this.props.logoutUser()
  }

  render() {
    const isLoggedIn = this.props.auth.get('isLoggedIn')
    const user = this.props.auth.get('user')
    const userName =
      user && user.user ? user.user.name ?? user.user.email : 'User'
    const avatarLetter = userName ? userName.substr(0, 1) : 'X'

    console.log('----------', isLoggedIn, user)

    return (
      <div className="userWidget">
        {isLoggedIn && (
          <div className="flex">
            <Button onClick={() => this.handleLogout()}>
              {userName}
              <br />
              Logout
            </Button>
            {user && user.avatar ? (
              <Avatar alt="User Avatar Icon" src={user.avatar} />
            ) : (
              <Avatar alt="User Avatar">{avatarLetter}</Avatar>
            )}
          </div>
        )}
        {!isLoggedIn && (
          <Button>
            <NextLink href="/auth/login">
              <Link className="loginText" title="Login">
                Login
              </Link>
            </NextLink>
          </Button>
        )}
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NavUserBadge)
