import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import OutlinedInput from '@mui/material/OutlinedInput'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { CreatorService } from '../../../social/services/CreatorService'
import { useCreatorState } from '../../../social/services/CreatorService'
import { useDispatch } from '../../../store'
import { AuthService } from '../../services/AuthService'
import { useAuthState } from '../../services/AuthService'
import styles from './Auth.module.scss'

const initialState = { email: '', password: '' }

interface Props {}

export const PasswordLoginApp = (props: Props): any => {
  const {} = props
  const dispatch = useDispatch()
  const auth = useAuthState()
  const history = useHistory()
  const { t } = useTranslation()
  const creatorsState = useCreatorState()
  useEffect(() => {
    if (auth) {
      const user = auth.user
      const userId = user ? user.id.value : null

      if (userId) {
        CreatorService.createCreator()
      }
    }
  }, [auth])

  useEffect(() => {
    creatorsState.creators?.value?.currentCreator && history.push('/')
  }, [creatorsState.creators?.value?.currentCreator])

  const [state, setState] = useState(initialState)

  const handleInput = (e: any): void => setState({ ...state, [e.target.name]: e.target.value })

  const handleEmailLogin = (e: any): void => {
    e.preventDefault()
    AuthService.doLoginAuto(true)
  }

  const [showPassword, showHidePassword] = useState(false)
  const handleClickShowPassword = () => {
    showHidePassword(!showPassword)
  }

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  return (
    <Container component="main" maxWidth="xs">
      <div className={styles.paper}>
        <form className={styles.form} onSubmit={(e) => handleEmailLogin(e)}>
          <Grid container>
            <Grid item xs={12}>
              <OutlinedInput
                margin="dense"
                required
                fullWidth
                id="email"
                placeholder={t('user:auth.passwordLogin.ph-email')}
                name="email"
                autoComplete="email"
                autoFocus
                onChange={(e) => handleInput(e)}
              />
            </Grid>
            <Grid item xs={12}>
              <OutlinedInput
                margin="dense"
                required
                fullWidth
                name="password"
                placeholder={t('user:auth.passwordLogin.ph-password')}
                id="password"
                autoComplete="current-password"
                onChange={(e) => handleInput(e)}
                type={showPassword ? 'text' : 'password'}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      color="secondary"
                      size="large"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" fullWidth variant="contained" color="primary" className={styles.submit}>
                {t('user:auth.passwordLogin.lbl-login')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  )
}

const PasswordLoginWrapper = (props: Props): any => <PasswordLoginApp {...props} />

export default PasswordLoginWrapper
