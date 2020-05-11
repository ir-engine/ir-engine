import React from 'react'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Link from '@material-ui/core/Link'
import Grid from '@material-ui/core/Grid'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import {
  loginUserByGithub,
  registerUserByEmail,
  loginUserByGoogle,
  loginUserByFacebook
} from '../../../redux/auth/service'
import { selectAuthState } from '../../../redux/auth/selector'
import SignIn from '../Auth/Login'
import './auth.scss'
import { showDialog } from '../../../redux/dialog/service'

interface Props {
  auth: any
  registerUserByEmail: typeof registerUserByEmail
  loginUserByGithub: typeof loginUserByGithub
  loginUserByGoogle: typeof loginUserByGoogle
  loginUserByFacebook: typeof loginUserByFacebook
  showDialog: typeof showDialog
}

const mapStateToProps = (state: any) => {
  return {
    auth: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  registerUserByEmail: bindActionCreators(registerUserByEmail, dispatch),
  loginUserByGithub: bindActionCreators(loginUserByGithub, dispatch),
  loginUserByGoogle: bindActionCreators(loginUserByGoogle, dispatch),
  loginUserByFacebook: bindActionCreators(loginUserByFacebook, dispatch),
  showDialog: bindActionCreators(showDialog, dispatch)
})

class SignUp extends React.Component<Props> {
  state = {
    email: '',
    password: '',
    phone: ''
  }

  handleInput = (e: any) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleRegister = (e: any) => {
    e.preventDefault()
    this.props.registerUserByEmail({
      email: this.state.email,
      password: this.state.password
    })
  }

  // handleGithubLogin = (e: any) => {
  //   e.preventDefault()
  //   this.props.loginUserByGithub();
  // }

  // handleGoogleLogin = (e: any) => {
  //   e.preventDefault()
  //   this.props.loginUserByGithub();
  // }

  // handleFacebookLogin = (e: any) => {
  //   e.preventDefault()
  //   this.props.loginUserByGithub();
  // }

  render () {
    return (
      <Container component="main" maxWidth="xs">
        <div className={'paper'}>
          <Avatar className={'avatar'}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
              Sign up
          </Typography>
          <form className={'form'} noValidate onSubmit={(e) => this.handleRegister(e) }>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  onChange={(e) => this.handleInput(e)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  onChange={(e) => this.handleInput(e)}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={'submit'}
                >
                    Sign Up
                </Button>
              </Grid>
            </Grid>
            <Grid container justify="flex-end">
              <Grid item>
                <Link href="#" variant="body2" onClick={() => this.props.showDialog({
                  children: (
                    <SignIn />
                  )
                })}>
                    Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
      </Container>
    )
  }
}

function SignUpWrapper(props: any) {
  return <SignUp {...props}/>
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SignUpWrapper)
