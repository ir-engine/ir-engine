import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { useHistory } from 'react-router-dom'

import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'
import InputAdornment from '@material-ui/core/InputAdornment'
import IconButton from '@material-ui/core/IconButton'
import { Visibility, VisibilityOff } from '@material-ui/icons'
import OutlinedInput from '@material-ui/core/OutlinedInput'

import { selectAuthState } from '../../reducers/auth/selector'
import { doLoginAuto } from '../../reducers/auth/service'
import { User } from '@xrengine/common/src/interfaces/User'

import styles from './Auth.module.scss'
import { createCreator } from '../../../socialmedia/reducers/creator/service'
import { selectCreatorsState } from '../../../socialmedia/reducers/creator/selector'
import { useTranslation } from 'react-i18next'

const mapStateToProps = (state: any): any => {
  return {
    auth: selectAuthState(state),
    creatorsState: selectCreatorsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  // loginUserByPassword: bindActionCreators(loginUserByPassword, dispatch),
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch),
  createCreator: bindActionCreators(createCreator, dispatch)
})

const initialState = { email: '', password: '' }

interface Props {
  auth?: any
  // loginUserByPassword?: typeof loginUserByPassword;
  doLoginAuto?: typeof doLoginAuto
  createCreator?: typeof createCreator
  creatorsState?: any
}

export const PasswordLoginApp = (props: Props): any => {
  const {
    auth,
    // loginUserByPassword,
    doLoginAuto,
    createCreator,
    creatorsState
  } = props
  const history = useHistory()
  const { t } = useTranslation()

  useEffect(() => {
    if (auth) {
      const user = auth.get('user') as User
      const userId = user ? user.id : null

      if (userId) {
        createCreator()
      }
    }
  }, [auth])

  useEffect(() => {
    creatorsState && creatorsState.get('currentCreator') && history.push('/')
  }, [creatorsState])

  const [state, setState] = useState(initialState)

  const handleInput = (e: any): void => setState({ ...state, [e.target.name]: e.target.value })

  const handleEmailLogin = (e: any): void => {
    e.preventDefault()

    doLoginAuto(true)
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

export default connect(mapStateToProps, mapDispatchToProps)(PasswordLoginWrapper)
