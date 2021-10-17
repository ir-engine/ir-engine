import React, { useState } from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import { useDispatch } from '@xrengine/client-core/src/store'
import styles from './Auth.module.scss'
import { EmptyLayout } from '../../../common/components/Layout/EmptyLayout'
import { AuthService } from '../../state/AuthService'
import { useTranslation } from 'react-i18next'

interface Props {
  completeAction?: any
  resetPassword: any
  token: string
}

export default (props: Props): any => {
  const { resetPassword, token } = props
  const initialState = { password: '' }
  const [state, setState] = useState(initialState)
  const { t } = useTranslation()

  const handleInput = (e: any): void => {
    e.preventDefault()
    setState({ ...state, [e.target.name]: e.target.value })
  }
  const handleReset = (e: any): void => {
    e.preventDefault()
    resetPassword(token, state.password)
    if (props.completeAction) props.completeAction()
  }

  return (
    <EmptyLayout>
      <Container component="main" maxWidth="xs">
        <div className={styles.paper}>
          <Typography component="h1" variant="h5">
            {t('user:auth.resetPassword.header')}
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center">
            {t('user:auth.resetPassword.description')}
          </Typography>
          <form className={styles.form} noValidate onSubmit={(e) => handleReset(e)}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="password"
              label={t('user:auth.resetPassword.lbl-password')}
              name="password"
              autoComplete="password"
              autoFocus
              onChange={(e) => handleInput(e)}
            />
            <Button type="submit" fullWidth variant="contained" color="primary" className={styles.submit}>
              {t('user:auth.resetPassword.lbl-submit')}
            </Button>
          </form>
        </div>
      </Container>
    </EmptyLayout>
  )
}
