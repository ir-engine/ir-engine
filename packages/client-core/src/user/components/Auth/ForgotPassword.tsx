import React, { useState } from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { AuthService } from '../../services/AuthService'
import Grid from '@mui/material/Grid'
import styles from './Auth.module.scss'
import { useTranslation } from 'react-i18next'

interface Props {
  classes: any
}

const ForgotPasswordComponent = (props: Props): any => {
  const { classes } = props
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

        <Typography variant="body2" color="textSecondary" align="center">
          {t('user:auth.forgotPassword.enterEmail')}
        </Typography>

        <form className={styles.form} noValidate onSubmit={(e) => handleForgot(e)}>
          <Grid container>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label={t('user:auth.forgotPassword.lbl-email')}
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

export default ForgotPasswordWrapper
