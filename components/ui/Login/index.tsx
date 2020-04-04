import React from 'react'
import Link from 'next/link'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

type State = {
  email?: ''
  password?: ''
  loggedIn?: boolean
  open?: boolean
}

export default class Login extends React.Component {
  state: State = {
    email: '',
    password: '',
    loggedIn: false,
    open: false
  }

  handleInput = (e: any) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleEmailLogin = (e: any) => {
    e.preventDefault()
  }

  handleEmailSignup = (e: any) => {
    e.preventDefault()
  }

  render() {
    return (
      <Dialog open={!this.state.loggedIn}>
        <DialogTitle id="login-form">Log In</DialogTitle>

        <DialogContent>
          <DialogContentText>
            You must be logged in to continue. Registration is easy and free!
          </DialogContentText>

          <Link href="/oauth/github">
            <a>Log In With Github</a>
          </Link>

          <TextField
            type="email"
            name="email"
            id="email"
            placeholder="email"
            value={this.state.email}
            onChange={(e: any) => this.handleInput(e)}
          />

          <TextField
            type="password"
            name="password"
            placeholder="password"
            value={this.state.password}
            onChange={(e: any) => this.handleInput(e)}
          />
          <Button id="signup" onClick={(e: any) => this.handleEmailSignup(e)}>
            Sign Up
          </Button>
          <Button id="login" onClick={(e: any) => this.handleEmailLogin(e)}>
            {' '}
            Login{' '}
          </Button>
        </DialogContent>
      </Dialog>
    )
  }
}
