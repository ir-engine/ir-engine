import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { connect } from 'react-redux'
import './style.scss'
import { bindActionCreators, Dispatch } from 'redux'
import {
  loginUserByGithub,
  loginUserByPassword,
  logoutUser,
  registerUserByEmail
} from '../../../redux/auth/service'
import { selectAuthState } from '../../../redux/auth/selector'

interface LoginProps {
  auth: any
  loginUserByPassword: typeof loginUserByPassword
  logoutUser: typeof logoutUser
  loginUserByGithub: typeof loginUserByGithub
  registerUserByEmail: typeof registerUserByEmail
}

const mapStateToProps = (state: any) => {
  return {
    auth: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loginUserByPassword: bindActionCreators(loginUserByPassword, dispatch),
  logoutUser: bindActionCreators(logoutUser, dispatch),
  loginUserByGithub: bindActionCreators(loginUserByGithub, dispatch),
  registerUserByEmail: bindActionCreators(registerUserByEmail, dispatch)
})

class Login extends React.Component<LoginProps> {
  state = {
    email: '',
    password: ''
  }

  handleInput = (e: any) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleEmailLogin = (e: any) => {
    e.preventDefault()
    this.props.loginUserByPassword({
      email: this.state.email,
      password: this.state.password
    })
  }

  handleGithubLogin = (e: any) => {
    e.preventDefault()
    this.props.loginUserByGithub()
  }

  handleEmailSignup = (e: any) => {
    e.preventDefault()

    this.props.registerUserByEmail({
      email: this.state.email,
      password: this.state.password
    })
  }

  render() {
    const { auth } = this.props

    return (
      <Dialog className="dialog" open={!auth.get('isLoggedIn')}>
        <DialogTitle id="login-form" className="title">
          Enter your e-mail or phone number to login!
        </DialogTitle>
        <DialogContent className="dialogContent">
          <DialogContentText className="dialogContentText">
              If you don't have account, we'll make one for you automagically!
          </DialogContentText>

          {/* <Button onClick={(e: any) => this.handleGithubLogin(e)}>
            <a>Log In With Github</a>
    </Button> */}

          <TextField
            className="inputField"
            type="email"
            name="email"
            id="email"
            placeholder=""
            value={this.state.email}
            onChange={(e: any) => this.handleInput(e)}
            autoFocus
          />

          <Button id="login" onClick={(e: any) => this.handleEmailLogin(e)}>
            {' '}
            Go!{' '}
          </Button>
        </DialogContent>
      </Dialog>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)
