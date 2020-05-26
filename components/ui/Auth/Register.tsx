import { useState } from 'react'
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
import { registerUserByEmail } from '../../../redux/auth/service'
import SignIn from './Login'
import './style.scss'
import { showDialog } from '../../../redux/dialog/service'

const mapDispatchToProps = (dispatch: Dispatch) => ({
  registerUserByEmail: bindActionCreators(registerUserByEmail, dispatch),
  showDialog: bindActionCreators(showDialog, dispatch)
})

interface Props {
  registerUserByEmail: typeof registerUserByEmail
  showDialog: typeof showDialog
}

const SignUp = (props: Props) => {
  const { registerUserByEmail, showDialog } = props
  const initialState = {
    email: '',
    password: '',
    phone: ''
  }
  const [state, setState] = useState(initialState)

  const handleInput = (e: any) => {
    e.preventDefault()
    setState({ ...state, [e.target.name]: e.target.value })
  }

  const handleRegister = (e: any) => {
    e.preventDefault()
    registerUserByEmail({
      email: state.email,
      password: state.password
    })
  }

  return (
    <Container component="main" maxWidth="xs">
      <div className={'paper'}>
        <Avatar className={'avatar'}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <form className={'form'} noValidate onSubmit={(e) => handleRegister(e)}>
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
                onChange={(e) => handleInput(e)}
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
                onChange={(e) => handleInput(e)}
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
              <Link
                href="#"
                variant="body2"
                onClick={() =>
                  showDialog({
                    children: <SignIn />
                  })
                }
              >
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  )
}

const SignUpWrapper = (props: any) => <SignUp {...props} />

export default connect(mapDispatchToProps)(SignUpWrapper)
