import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Check, Close, Create, GitHub, Send } from '@mui/icons-material'
import { useAuthState } from '../../../services/AuthService'
import { AuthService } from '../../../services/AuthService'
import React, { useEffect, useState } from 'react'
import { useDispatch } from '../../../../store'
import { FacebookIcon } from '../../../../common/components/Icons/FacebookIcon'
import { GoogleIcon } from '../../../../common/components/Icons/GoogleIcon'
import { LinkedInIcon } from '../../../../common/components/Icons/LinkedInIcon'
import { TwitterIcon } from '../../../../common/components/Icons/TwitterIcon'
import { getAvatarURLForUser, Views } from '../util'
import { Config, validateEmail, validatePhoneNumber } from '@xrengine/common/src/config'
import * as polyfill from 'credential-handler-polyfill'
import styles from '../UserMenu.module.scss'
import { useTranslation } from 'react-i18next'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import Tooltip from '@mui/material/Tooltip'
import Grid from '@mui/material/Grid'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar'
import { AuthSettingService } from '../../../../admin/services/Setting/AuthSettingService'
import { useAdminAuthSettingState } from '../../../../admin/services/Setting/AuthSettingService'
import { useHistory } from 'react-router-dom'

interface Props {
  changeActiveMenu?: any
  setProfileMenuOpen?: any

  hideLogin?: any
}

const initialState = {
  jwt: true,
  local: false,
  facebook: false,
  github: false,
  google: false,
  linkedin: false,
  twitter: false,
  smsMagicLink: false,
  emailMagicLink: false
}

const history = useHistory()
const selfUser = useAuthState().user
const ProfileMenu = (props: Props): any => {
  const { changeActiveMenu, setProfileMenuOpen, hideLogin } = props
  const { t } = useTranslation()

  const dispatch = useDispatch()
  const selfUser = useAuthState().user

  const [username, setUsername] = useState(selfUser?.name.value)
  const [emailPhone, setEmailPhone] = useState('')
  const [error, setError] = useState(false)
  const [errorUsername, setErrorUsername] = useState(false)
  const [showUserId, setShowUserId] = useState(false)
  const [userIdState, setUserIdState] = useState({ value: '', copied: false, open: false })
  const authSettingState = useAdminAuthSettingState()
  const [authSetting] = authSettingState?.authSettings?.value || []
  const [authState, setAuthState] = useState(initialState)

  useEffect(() => {
    !authSetting && AuthSettingService.fetchAuthSetting()
  }, [])

  useEffect(() => {
    if (authSetting) {
      let temp = { ...initialState }
      authSetting?.authStrategies?.forEach((el) => {
        Object.entries(el).forEach(([strategyName, strategy]) => {
          temp[strategyName] = strategy
        })
      })
      setAuthState(temp)
    }
  }, [authSettingState?.updateNeeded?.value])

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
    selfUser && setUsername(selfUser.name.value)
  }, [selfUser.name.value])

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
    if (selfUser.name.value.trim() !== name) {
      AuthService.updateUsername(selfUser.id.value, name)
    }
  }
  const handleInputChange = (e) => setEmailPhone(e.target.value)

  const validate = () => {
    if (emailPhone === '') return false
    if (validateEmail(emailPhone.trim()) && authState?.emailMagicLink) type = 'email'
    else if (validatePhoneNumber(emailPhone.trim()) && authState.smsMagicLink) type = 'sms'
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
    if (type === 'email') AuthService.addConnectionByEmail(emailPhone, selfUser?.id?.value!)
    else if (type === 'sms') AuthService.addConnectionBySms(emailPhone, selfUser?.id?.value!)
    return
  }

  const handleOAuthServiceClick = (e) => {
    AuthService.loginUserByOAuth(e.currentTarget.id)
  }

  const handleLogout = async (e) => {
    if (changeActiveMenu != null) changeActiveMenu(null)
    else if (setProfileMenuOpen != null) setProfileMenuOpen(false)
    await AuthService.logoutUser()
    // window.location.reload()
  }

  const handleWalletLoginClick = async (e) => {
    const domain = window.location.origin
    const challenge = '99612b24-63d9-11ea-b99f-4f66f3e4f81a' // TODO: generate

    console.log('Sending DIDAuth query...')

    const didAuthQuery: any = {
      web: {
        VerifiablePresentation: {
          query: [
            {
              type: 'DIDAuth'
            }
          ],
          challenge,
          domain // e.g.: requestingparty.example.com
        }
      }
    }

    // Use Credential Handler API to authenticate
    const result: any = await navigator.credentials.get(didAuthQuery)
    console.log(result)

    AuthService.loginUserByXRWallet(result)
  }

  const handleShowId = () => {
    setShowUserId(!showUserId)
    setUserIdState({ ...userIdState, value: selfUser.id.value })
  }

  const handleClose = () => {
    setUserIdState({ ...userIdState, open: false })
  }

  const getConnectText = () => {
    if (authState?.emailMagicLink && authState?.smsMagicLink) {
      return t('user:usermenu.profile.connectPhoneEmail')
    } else if (authState?.emailMagicLink && !authState?.smsMagicLink) {
      return t('user:usermenu.profile.connectEmail')
    } else if (!authState?.emailMagicLink && authState?.smsMagicLink) {
      return t('user:usermenu.profile.connectPhone')
    } else {
      return ''
    }
  }

  const getErrorText = () => {
    if (authState?.emailMagicLink && authState?.smsMagicLink) {
      return t('user:usermenu.profile.phoneEmailError')
    } else if (authState?.emailMagicLink && !authState?.smsMagicLink) {
      return t('user:usermenu.profile.emailError')
    } else if (!authState?.emailMagicLink && authState?.smsMagicLink) {
      return t('user:usermenu.profile.phoneError')
    } else {
      return ''
    }
  }

  const getConnectPlaceholder = () => {
    if (authState?.emailMagicLink && authState?.smsMagicLink) {
      return t('user:usermenu.profile.ph-phoneEmail')
    } else if (authState?.emailMagicLink && !authState?.smsMagicLink) {
      return t('user:usermenu.profile.ph-email')
    } else if (!authState?.emailMagicLink && authState?.smsMagicLink) {
      return t('user:usermenu.profile.ph-phone')
    } else {
      return ''
    }
  }

  const enableSocial =
    authState?.facebook || authState?.github || authState?.google || authState?.linkedin || authState?.twitter

  const enableConnect = authState?.emailMagicLink || authState?.smsMagicLink

  return (
    <div className={styles.menuPanel}>
      <section className={styles.profilePanel}>
        <section className={styles.profileBlock}>
          <div className={styles.avatarBlock}>
            <img src={getAvatarURLForUser(selfUser?.id?.value)} />
            {changeActiveMenu != null && (
              <Button
                className={styles.avatarBtn}
                id="select-avatar"
                onClick={() => changeActiveMenu(Views.Avatar)}
                disableRipple
              >
                <Create />
              </Button>
            )}
          </div>
          <div className={styles.headerBlock}>
            <Typography variant="h1" className={styles.panelHeader}>
              {t('user:usermenu.profile.lbl-username')}
            </Typography>
            <span className={styles.inputBlock}>
              <TextField
                margin="none"
                size="small"
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

            <Grid container justifyContent="right">
              <Grid item xs={6}>
                <h2>
                  {selfUser?.userRole?.value === 'admin'
                    ? t('user:usermenu.profile.youAreAn')
                    : t('user:usermenu.profile.youAreA')}{' '}
                  <span>{selfUser?.userRole?.value}</span>.
                </h2>
              </Grid>
              <Grid item container xs={6} alignItems="flex-start" direction="column">
                <Tooltip title="Show User ID" placement="right">
                  <h2 size="small" className={styles.showUserId} onClick={handleShowId}>
                    {showUserId ? t('user:usermenu.profile.hideUserId') : t('user:usermenu.profile.showUserId')}{' '}
                  </h2>
                </Tooltip>
              </Grid>
            </Grid>

            <h4>
              {(selfUser.userRole.value === 'user' || selfUser.userRole.value === 'admin') && (
                <div className={styles.logout} onClick={handleLogout}>
                  {t('user:usermenu.profile.logout')}
                </div>
              )}
            </h4>
            {selfUser?.inviteCode.value != null && (
              <h2>
                {t('user:usermenu.profile.inviteCode')}: {selfUser.inviteCode.value}
              </h2>
            )}
            <button onClick={() => history.push(`/inventory/${selfUser.id.value}`)} className={styles.walletBtn}>
                My Inventory
              </button>
              <button onClick={() => history.push(`/trading/${selfUser.id.value}`)} className={styles.walletBtn}>
                My Trading
              </button>
          </div>
        </section>

        {showUserId && (
          <section className={styles.emailPhoneSection}>
            <Typography variant="h1" className={styles.panelHeader}>
              User id
            </Typography>

            <form>
              <TextField
                className={styles.emailField}
                size="small"
                placeholder={'user id'}
                variant="outlined"
                value={selfUser?.id.value}
                onChange={({ target: { value } }) => setUserIdState({ ...userIdState, value, copied: false })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <CopyToClipboard
                        text={userIdState.value}
                        onCopy={() => {
                          setUserIdState({ ...userIdState, copied: true, open: true })
                        }}
                      >
                        <a href="#" className={styles.materialIconBlock}>
                          <ContentCopyIcon className={styles.primaryForeground} />
                        </a>
                      </CopyToClipboard>
                    </InputAdornment>
                  )
                }}
              />
            </form>
          </section>
        )}

        {!hideLogin && (
          <>
            {selfUser?.userRole.value === 'guest' && enableConnect && (
              <section className={styles.emailPhoneSection}>
                <Typography variant="h1" className={styles.panelHeader}>
                  {getConnectText()}
                </Typography>

                <form onSubmit={handleSubmit}>
                  <TextField
                    className={styles.emailField}
                    size="small"
                    placeholder={getConnectPlaceholder()}
                    variant="outlined"
                    onChange={handleInputChange}
                    onBlur={validate}
                    error={error}
                    helperText={error ? getErrorText() : null}
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
            {selfUser?.userRole.value === 'guest' && changeActiveMenu != null && (
              <section className={styles.walletSection}>
                <Typography variant="h3" className={styles.textBlock}>
                  {t('user:usermenu.profile.or')}
                </Typography>
                {/*<Button onClick={handleWalletLoginClick} className={styles.walletBtn}>
                  {t('user:usermenu.profile.lbl-wallet')}
                </Button>
                <br/>*/}
                <Button onClick={() => changeActiveMenu(Views.ReadyPlayer)} className={styles.walletBtn}>
                  {t('user:usermenu.profile.loginWithReadyPlayerMe')}
                </Button>
              </section>
            )}

            {selfUser?.userRole.value === 'guest' && enableSocial && (
              <section className={styles.socialBlock}>
                <Typography variant="h3" className={styles.textBlock}>
                  {t('user:usermenu.profile.connectSocial')}
                </Typography>
                <div className={styles.socialContainer}>
                  {authState?.google && (
                    <a href="#" id="google" onClick={handleOAuthServiceClick}>
                      <GoogleIcon width="40" height="40" viewBox="0 0 40 40" />
                    </a>
                  )}
                  {authState?.facebook && (
                    <a href="#" id="facebook" onClick={handleOAuthServiceClick}>
                      <FacebookIcon width="40" height="40" viewBox="0 0 40 40" />
                    </a>
                  )}
                  {authState?.linkedin && (
                    <a href="#" id="linkedin2" onClick={handleOAuthServiceClick}>
                      <LinkedInIcon width="40" height="40" viewBox="0 0 40 40" />
                    </a>
                  )}
                  {authState?.twitter && (
                    <a href="#" id="twitter" onClick={handleOAuthServiceClick}>
                      <TwitterIcon width="40" height="40" viewBox="0 0 40 40" />
                    </a>
                  )}
                  {authState?.github && (
                    <a href="#" id="github" onClick={handleOAuthServiceClick}>
                      <GitHub />
                    </a>
                  )}
                </div>
                <Typography variant="h4" className={styles.smallTextBlock}>
                  {t('user:usermenu.profile.createOne')}
                </Typography>
              </section>
            )}
            {setProfileMenuOpen != null && (
              <div className={styles.closeButton} onClick={() => setProfileMenuOpen(false)}>
                <Close />
              </div>
            )}
          </>
        )}
      </section>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={userIdState.open}
        onClose={handleClose}
        message="User ID copied"
        key={'top' + 'center'}
        autoHideDuration={2000}
      />
    </div>
  )
}

export default ProfileMenu