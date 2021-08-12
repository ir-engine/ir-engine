import React, { useState } from 'react'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Grid from '@material-ui/core/Grid'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { selectAuthState } from '../../reducers/auth/selector'
import { showDialog, closeDialog } from '../../../common/reducers/dialog/service'
import SignUp from './Register'
import ForgotPassword from './ForgotPassword'
import styles from './Auth.module.scss'
import { User } from '@xrengine/common/src/interfaces/User'
import { loginUserByPassword, addConnectionByPassword } from '../../reducers/auth/service'
import { useTranslation } from 'react-i18next'

const mapStateToProps = (state: any): any => {
  return {
    auth: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  loginUserByPassword: bindActionCreators(loginUserByPassword, dispatch),
  addConnectionByPassword: bindActionCreators(addConnectionByPassword, dispatch),
  showDialog: bindActionCreators(showDialog, dispatch),
  closeDialog: bindActionCreators(closeDialog, dispatch)
})

const initialState = { email: '', password: '' }

interface Props {
  auth?: any
  isAddConnection?: boolean
  addConnectionByPassword?: typeof addConnectionByPassword
  loginUserByPassword?: typeof loginUserByPassword
  closeDialog?: typeof closeDialog
  showDialog?: typeof showDialog
}

export const PasswordLogin = (props: Props): any => {
  const { auth, isAddConnection, addConnectionByPassword, loginUserByPassword, closeDialog, showDialog } = props
  const [state, setState] = useState(initialState)
  const { t } = useTranslation()

  const handleInput = (e: any): void => setState({ ...state, [e.target.name]: e.target.value })

  const handleEmailLogin = (e: any): void => {
    e.preventDefault()

    if (isAddConnection) {
      const user = auth.get('user') as User
      const userId = user ? user.id : ''

      addConnectionByPassword(
        {
          email: state.email,
          password: state.password
        },
        userId
      )
      closeDialog()
    } else {
      loginUserByPassword({
        email: state.email,
        password: state.password
      })
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <div className={styles.paper}>
        <Avatar className={styles.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          {t('user:auth.passwordLogin.header')}
        </Typography>
        <form className={styles.form} noValidate onSubmit={(e) => handleEmailLogin(e)}>
          <Grid container>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label={t('user:auth.passwordLogin.lbl-email')}
                name="email"
                autoComplete="email"
                autoFocus
                onChange={(e) => handleInput(e)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label={t('user:auth.passwordLogin.lbl-password')}
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={(e) => handleInput(e)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label={t('user:auth.passwordLogin.lbl-rememberMe')}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" fullWidth variant="contained" color="primary" className={styles.submit}>
                {t('user:auth.passwordLogin.lbl-signin')}
              </Button>
            </Grid>

            <Grid item xs>
              {!isAddConnection && (
                <a
                  href="#"
                  // variant="body2"
                  onClick={() =>
                    showDialog({
                      children: <ForgotPassword />
                    })
                  }
                >
                  {t('user:auth.passwordLogin.forgotPassword')}
                </a>
              )}
            </Grid>
            <Grid item>
              {!isAddConnection && (
                <a
                  href="#"
                  // variant="body2"
                  onClick={() =>
                    showDialog({
                      children: <SignUp />
                    })
                  }
                >
                  {t('user:auth.passwordLogin.signup')}
                </a>
              )}
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  )
}

const PasswordLoginWrapper = (props: Props): any => <PasswordLogin {...props} />

export default connect(mapStateToProps, mapDispatchToProps)(PasswordLoginWrapper)
