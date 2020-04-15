import Link from '@material-ui/core/Typography'
import NextLink from 'next/link'
import React, { Component } from 'react'
import Button from '@material-ui/core/Button'

import './style.scss'

// Get auth state from redux
// Get user email address
// If not logged in, show login
// If logged in, show email address and user icon

export default class NavUserWidget extends Component {

  render() {
    return (
      <div className="userWidget">
        <Button>
          <NextLink href="/auth/login">
            <Link className="loginText" title="Login">Login</Link>
          </NextLink>
        </Button>
      </div>
    )
  }
}
