import React, { useRef, useState } from 'react'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import { useDispatch } from '../../../store'
import { AuthService } from '../../services/AuthService'
import styles from './Auth.module.scss'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

interface Props {}

const SignUp = (props: Props): any => {
  const dispatch = useDispatch()

  const initialState = {
    email: '',
    password: ''
  }
  const [state, setState] = useState(initialState)
  const { t } = useTranslation()

  const handleInput = (e: any): void => {
    e.preventDefault()
    setState({ ...state, [e.target.name]: e.target.value })
  }

  const handleRegister = (e: any): void => {
    e.preventDefault()
    console.log('handleRegister', {
      email: state.email,
      password: state.password
    })
    dispatch(
      AuthService.registerUserByEmail({
        email: state.email,
        password: state.password
      })
    )
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
      confirm_password.current.setCustomValidity(t('user:auth.register.passwordNotMatch'))
    } else {
      confirm_password.current.setCustomValidity('')
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <div className={styles.paper}>
        <form className={styles.form} onSubmit={(e) => handleRegister(e)}>
          <Grid container>
            <Grid item xs={12}>
              <OutlinedInput
                margin="dense"
                required
                fullWidth
                id="email"
                placeholder={t('user:auth.register.ph-email')}
                name="email"
                autoComplete="email"
                onChange={(e) => handleInput(e)}
              />
            </Grid>
            <Grid item xs={12}>
              <OutlinedInput
                margin="dense"
                required
                fullWidth
                name="password"
                placeholder={t('user:auth.register.ph-password')}
                type={values.showPassword ? 'text' : 'password'}
                id="password"
                inputRef={password}
                autoComplete="current-password"
                onChange={(e) => handleInput(e)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      color="secondary"
                      size="large"
                    >
                      {values.showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </Grid>
            <Grid item xs={12}>
              <OutlinedInput
                margin="dense"
                required
                fullWidth
                name="confirm_password"
                placeholder={t('user:auth.register.ph-confirmPassword')}
                type={values.showPasswordConfirm ? 'text' : 'password'}
                id="confirm_password"
                inputRef={confirm_password}
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
                      size="large"
                    >
                      {values.showPasswordConfirm ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" fullWidth variant="contained" color="primary" className={styles.submit}>
                {t('user:auth.register.lbl-signup')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  )
}

const SignUpWrapper = (props: any): any => <SignUp {...props} />

export default SignUpWrapper
