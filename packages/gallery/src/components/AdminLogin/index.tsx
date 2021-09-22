import Button from '@material-ui/core/Button'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { Check, Close, Create, GitHub, Send } from '@material-ui/icons'

import { Network } from '@xrengine/engine/src/networking/classes/Network'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { Config, validateEmail, validatePhoneNumber } from '@xrengine/common/src/config'
import * as polyfill from 'credential-handler-polyfill'
import styles from './AdminLogin.module.scss'
import { useTranslation } from 'react-i18next'
import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector'
import {
  addConnectionByEmail,
  addConnectionBySms,
  loginUserByOAuth,
  loginUserByXRWallet,
  logoutUser,
  removeUser,
  updateUserAvatarId,
  updateUsername,
  updateUserSettings
} from '@xrengine/client-core/src/user/reducers/auth/service'
import { getAvatarURLFromNetwork, Views } from '@xrengine/client-core/src/user/components/UserMenu/util'

interface Props {
  changeActiveMenu?: any
  setProfileMenuOpen?: any
  authState?: any
  updateUsername?: any
  updateUserAvatarId?: any
  updateUserSettings?: any
  loginUserByOAuth?: any
  loginUserByXRWallet?: any
  addConnectionBySms?: any
  addConnectionByEmail?: any
  logoutUser?: any
  removeUser?: any
  hideLogin?: any
}

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateUsername: bindActionCreators(updateUsername, dispatch),
  updateUserAvatarId: bindActionCreators(updateUserAvatarId, dispatch),
  updateUserSettings: bindActionCreators(updateUserSettings, dispatch),
  loginUserByOAuth: bindActionCreators(loginUserByOAuth, dispatch),
  loginUserByXRWallet: bindActionCreators(loginUserByXRWallet, dispatch),
  addConnectionBySms: bindActionCreators(addConnectionBySms, dispatch),
  addConnectionByEmail: bindActionCreators(addConnectionByEmail, dispatch),
  logoutUser: bindActionCreators(logoutUser, dispatch),
  removeUser: bindActionCreators(removeUser, dispatch)
})

const AdminLogin = (props: Props): any => {
  const {
    authState,
    updateUsername,
    addConnectionByEmail,
    addConnectionBySms,
    loginUserByOAuth,
    loginUserByXRWallet,
    logoutUser,
    changeActiveMenu,
    setProfileMenuOpen,
    hideLogin
  } = props
  const { t } = useTranslation()

  const selfUser = authState.get('user') || {}

  const [username, setUsername] = useState(selfUser?.name)
  const [emailPhone, setEmailPhone] = useState('')
  const [error, setError] = useState(false)
  const [errorUsername, setErrorUsername] = useState(false)

  let type = ''

  const loadCredentialHandler = async () => {
    try {
      const mediator = `${Config.publicRuntimeConfig.mediatorServer}/mediator?origin=${encodeURIComponent(
        window.location.origin
      )}`

      await polyfill.loadOnce(mediator)
      console.log('Ready to work with credentials!')
    } catch (e) {
      console.error('Error loading polyfill:', e)
    }
  }

  useEffect(() => {
    loadCredentialHandler()
  }, []) // Only run once

  useEffect(() => {
    selfUser && setUsername(selfUser.name)
  }, [selfUser.name])

  const updateUserName = (e) => {
    e.preventDefault()
    handleUpdateUsername()
  }

  const handleUsernameChange = (e) => {
    setUsername(e.target.value)
    if (!e.target.value) setErrorUsername(true)
  }

  const handleUpdateUsername = () => {
    const name = username.trim()
    if (!name) return
    if (selfUser.name.trim() !== name) {
      updateUsername(selfUser.id, name)
    }
  }
  const handleInputChange = (e) => setEmailPhone(e.target.value)

  const validate = () => {
    if (emailPhone === '') return false
    if (validateEmail(emailPhone.trim())) type = 'email'
    else if (validatePhoneNumber(emailPhone.trim())) type = 'sms'
    else {
      setError(true)
      return false
    }

    setError(false)
    return true
  }

  const handleSubmit = (e: any): any => {
    e.preventDefault()
    if (!validate()) return
    if (type === 'email') addConnectionByEmail(emailPhone, selfUser?.id)
    else if (type === 'sms') addConnectionBySms(emailPhone, selfUser?.id)

    return
  }

  const handleLogout = async (e) => {
    if (changeActiveMenu != null) changeActiveMenu(null)
    else if (setProfileMenuOpen != null) setProfileMenuOpen(false)
    await logoutUser()
    // window.location.reload()
  }

  return (
    <div className={styles.menuPanel}>
      <section className={styles.profilePanel}>
        <section className={styles.profileBlock}>
          <div className={styles.headerBlock}>
            <span className={styles.inputBlock}>
              <TextField
                margin="none"
                size="small"
                label={t('user:usermenu.profile.lbl-username')}
                name="username"
                variant="outlined"
                value={username || ''}
                onChange={handleUsernameChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') updateUserName(e)
                }}
                className={styles.usernameInput}
                error={errorUsername}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <a href="#" className={styles.materialIconBlock} onClick={updateUserName}>
                        <Check className={styles.primaryForeground} />
                      </a>
                    </InputAdornment>
                  )
                }}
              />
            </span>
            <h2>
              {selfUser?.userRole === 'admin'
                ? t('user:usermenu.profile.youAreAn')
                : t('user:usermenu.profile.youAreA')}{' '}
              <span>{selfUser?.userRole}</span>.
            </h2>
            <h4>
              {(selfUser.userRole === 'user' || selfUser.userRole === 'admin') && (
                <div onClick={handleLogout}>{t('user:usermenu.profile.logout')}</div>
              )}
            </h4>
            {selfUser?.inviteCode != null && (
              <h2>
                {t('user:usermenu.profile.inviteCode')}: {selfUser.inviteCode}
              </h2>
            )}
          </div>
        </section>
        {!hideLogin && (
          <>
            {selfUser?.userRole === 'guest' && (
              <section className={styles.emailPhoneSection}>
                <Typography variant="h1" className={styles.panelHeader}>
                  {t('user:usermenu.profile.connectPhone')}
                </Typography>

                <form onSubmit={handleSubmit}>
                  <TextField
                    className={styles.emailField}
                    size="small"
                    placeholder={t('user:usermenu.profile.ph-phoneEmail')}
                    variant="outlined"
                    onChange={handleInputChange}
                    onBlur={validate}
                    error={error}
                    helperText={error ? t('user:usermenu.profile.phoneEmailError') : null}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end" onClick={handleSubmit}>
                          <a href="#" className={styles.materialIconBlock}>
                            <Send className={styles.primaryForeground} />
                          </a>
                        </InputAdornment>
                      )
                    }}
                  />
                </form>
              </section>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminLogin)
