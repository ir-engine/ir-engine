import React from 'react'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Link from '@material-ui/core/Link'
import Grid from '@material-ui/core/Grid'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { selectAuthState } from '../../../redux/auth/selector'
import {
  loginUserByPassword, addConnectionByPassword
} from '../../../redux/auth/service'
import { showDialog, closeDialog } from '../../../redux/dialog/service'
import SignUp from '../Auth/Register'
import ForgotPassword from '../Auth/ForgotPassword'
import './auth.scss'
import { User } from 'interfaces/User'

interface Props {
  auth: any,
  isAddConnection?: boolean,
  loginUserByPassword: typeof loginUserByPassword,
  addConnectionByPassword: typeof addConnectionByPassword,
  showDialog: typeof showDialog,
  closeDialog: typeof closeDialog
}

const mapStateToProps = (state: any) => {
  return {
    auth: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loginUserByPassword: bindActionCreators(loginUserByPassword, dispatch),
  addConnectionByPassword: bindActionCreators(addConnectionByPassword, dispatch),
  showDialog: bindActionCreators(showDialog, dispatch),
  closeDialog: bindActionCreators(closeDialog, dispatch)
})

class PasswordLogin extends React.Component<Props> {
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

    if (this.props.isAddConnection) {
      const user = this.props.auth.get('user') as User
      const userId = user ? user.id : ''

      this.props.addConnectionByPassword({
        email: this.state.email,
        password: this.state.password
      },
      userId
      )
      this.props.closeDialog()
    } else {
      this.props.loginUserByPassword({
        email: this.state.email,
        password: this.state.password
      })
    }
  }

  render() {
    const { isAddConnection } = this.props

    return (
      <Container component="main" maxWidth="xs">
        <div className={'paper'}>
          <Avatar className={'avatar'}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
              Sign in
          </Typography>
          <form className={'form'} noValidate onSubmit={(e) => this.handleEmailLogin(e)}>
            <Grid container>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  onChange={(e) => this.handleInput(e)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
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
                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" />}
                  label="Remember me"
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
                    Sign In
                </Button>
              </Grid>

              <Grid item xs>
                {
                  !isAddConnection &&
                    <Link href="#" variant="body2" onClick={() => this.props.showDialog({
                      children: (
                        <ForgotPassword />
                      )
                    })}>
                      Forgot password?
                    </Link>
                }

              </Grid>
              <Grid item>
                {
                  !isAddConnection &&
                    <Link href="#" variant="body2" onClick={() => this.props.showDialog({
                      children: (
                        <SignUp />
                      )
                    })}>
                      Don&apos;t have an account? Sign Up
                    </Link>
                }
              </Grid>
            </Grid>
          </form>
        </div>
      </Container>
    )
  }
}

function PasswordLoginWrapper(props: any) {
  return <PasswordLogin {...props}/>
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PasswordLoginWrapper)
