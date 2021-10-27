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
import { useDispatch } from '../../../store'
import { useAuthState } from '../../state/AuthService'
import { DialogAction } from '../../../common/state/DialogService'
import SignUp from './Register'
import ForgotPassword from './ForgotPassword'
import styles from './Auth.module.scss'
import { AuthService } from '../../state/AuthService'
import { useTranslation } from 'react-i18next'

const initialState = { email: '', password: '' }

interface Props {
  isAddConnection?: boolean
}

export const PasswordLogin = (props: Props): any => {
  const { isAddConnection } = props
  const auth = useAuthState()
  const [state, setState] = useState(initialState)
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const handleInput = (e: any): void => setState({ ...state, [e.target.name]: e.target.value })

  const handleEmailLogin = (e: any): void => {
    e.preventDefault()

    if (isAddConnection) {
      const user = auth.user
      const userId = user ? user.id.value : ''

      dispatch(
        AuthService.addConnectionByPassword(
          {
            email: state.email,
            password: state.password
          },
          userId
        )
      )
      dispatch(DialogAction.dialogClose())
    } else {
      dispatch(
        AuthService.loginUserByPassword({
          email: state.email,
          password: state.password
        })
      )
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
                    dispatch(
                      DialogAction.dialogShow({
                        children: <ForgotPassword />
                      })
                    )
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
                    dispatch(
                      DialogAction.dialogShow({
                        children: <SignUp />
                      })
                    )
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

export default PasswordLoginWrapper
