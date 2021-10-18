import Button from '@material-ui/core/Button'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import Typography from '@material-ui/core/Typography'
import { useDispatch } from '../../../store'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthService } from '../../state/AuthService'
import styles from './Auth.module.scss'

interface Props {
  classes: any
}

const ForgotPasswordComponent = (props: Props): any => {
  const { classes } = props
  const dispatch = useDispatch()
  const [state, setState] = useState({ email: '', isSubmitted: false })
  const { t } = useTranslation()

  const handleInput = (e: any): void => {
    e.preventDefault()
    setState({ ...state, [e.target.name]: e.target.value })
  }

  const handleForgot = (e: any): void => {
    e.preventDefault()
    AuthService.forgotPassword(state.email)
    setState({ ...state, isSubmitted: true })
  }

  return (
    <Container component="main" maxWidth="xs">
      <div className={styles.paper}>
        <Typography component="h1" variant="h5">
          {t('user:auth.forgotPassword.header')}
        </Typography>

        <Typography variant="body2" align="center">
          {t('user:auth.forgotPassword.enterEmail')}
        </Typography>

        <form className={styles.form} onSubmit={(e) => handleForgot(e)}>
          <Grid container>
            <Grid item xs={12}>
              <OutlinedInput
                margin="dense"
                required
                fullWidth
                id="email"
                placeholder={t('user:auth.forgotPassword.lbl-email')}
                name="email"
                autoComplete="email"
                autoFocus
                onChange={(e) => handleInput(e)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" fullWidth variant="contained" color="primary" className={styles.submit}>
                {t('user:auth.forgotPassword.lbl-submit')}
              </Button>
            </Grid>
          </Grid>
        </form>

        {state.isSubmitted ? (
          <Typography variant="body2" color="textSecondary" align="center">
            <br />
            {t('user:auth.forgotPassword.emailSent')}
          </Typography>
        ) : (
          ''
        )}
      </div>
    </Container>
  )
}

const ForgotPasswordWrapper = (props: any): any => <ForgotPasswordComponent {...props} />

export const ForgotPassword = ForgotPasswordWrapper
