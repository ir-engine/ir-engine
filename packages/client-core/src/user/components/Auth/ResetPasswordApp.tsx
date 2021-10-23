import React, { useRef, useState } from 'react'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import { EmptyLayout } from '../../../common/components/Layout/EmptyLayout'
import { AuthService } from '../../state/AuthService'
import styles from './Auth.module.scss'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import InputAdornment from '@material-ui/core/InputAdornment'
import IconButton from '@material-ui/core/IconButton'
import { Visibility, VisibilityOff } from '@material-ui/icons'
import { useTranslation } from 'react-i18next'
import { useDispatch } from '../../../store'

interface Props {
  token: string
  completeAction: () => void
}

export const ResetPassword = (props: Props): any => {
  const { token, completeAction } = props
  const dispatch = useDispatch()
  const initialState = { password: '', isSubmitted: false }
  const [state, setState] = useState(initialState)
  const { t } = useTranslation()

  const handleInput = (e: any): void => {
    e.preventDefault()
    setState({ ...state, [e.target.name]: e.target.value })
  }
  const handleReset = (e: any): void => {
    e.preventDefault()
    AuthService.resetPassword(token, state.password)
    setState({ ...state, isSubmitted: true })
  }

  const [values, setValues] = useState({ showPassword: false, showPasswordConfirm: false })
  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword })
  }
  const handleClickShowPasswordConfirm = () => {
    setValues({ ...values, showPasswordConfirm: !values.showPasswordConfirm })
  }

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const password = useRef<HTMLInputElement>()
  const confirm_password = useRef<HTMLInputElement>()
  function validatePassword() {
    if (password.current.value != confirm_password.current.value) {
      confirm_password.current.setCustomValidity(t('user:auth.resetPassword.passwordNotMatch'))
    } else {
      confirm_password.current.setCustomValidity('')
    }
  }

  return (
    <EmptyLayout>
      <Container component="main" maxWidth="xs">
        <div className={styles.paper}>
          {state.isSubmitted ? (
            <>
              <Typography component="h1" variant="h5" align="center">
                Your password was successfully reset!
              </Typography>
              <Typography variant="body2" align="center">
                You can now log into the your account.
              </Typography>
              <Button fullWidth variant="contained" color="primary" className={styles.submit} onClick={completeAction}>
                {t('user:auth.resetPassword.login')}
              </Button>
            </>
          ) : (
            <>
              <Typography component="h1" variant="h5">
                {t('user:auth.resetPassword.header')}
              </Typography>
              <Typography variant="body2" align="center">
                {t('user:auth.resetPassword.description')}
              </Typography>
              <form className={styles.form} onSubmit={(e) => handleReset(e)}>
                <OutlinedInput
                  inputRef={password}
                  margin="dense"
                  required
                  fullWidth
                  name="password"
                  placeholder={t('user:auth.resetPassword.lbl-password')}
                  type={values.showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  onChange={(e) => handleInput(e)}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        color="secondary"
                      >
                        {values.showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                <OutlinedInput
                  margin="dense"
                  required
                  fullWidth
                  inputRef={confirm_password}
                  name="confirm_password"
                  placeholder={t('user:auth.resetPassword.lbl-confirmPassword')}
                  type={values.showPasswordConfirm ? 'text' : 'password'}
                  id="confirm_password"
                  autoComplete="current-password"
                  onChange={(e) => handleInput(e)}
                  onKeyUp={validatePassword}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPasswordConfirm}
                        onMouseDown={handleMouseDownPassword}
                        color="secondary"
                      >
                        {values.showPasswordConfirm ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                <Button type="submit" fullWidth variant="contained" color="primary" className={styles.submit}>
                  {t('user:auth.resetPassword.lbl-submit')}
                </Button>
              </form>
            </>
          )}
        </div>
      </Container>
    </EmptyLayout>
  )
}
