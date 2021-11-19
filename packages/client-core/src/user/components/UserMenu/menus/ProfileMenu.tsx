import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Check, Close, Create, GitHub, Send, Cancel } from '@mui/icons-material'
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
import { useHistory } from 'react-router-dom'
import { IconButton, Stack } from '@mui/material'
import { DialogTitle, Dialog, DialogContent } from '@material-ui/core'

interface Props {
  changeActiveMenu?: any
  setProfileMenuOpen?: any

  hideLogin?: any
}

const ProfileMenu = (props: Props): any => {
  const { changeActiveMenu, setProfileMenuOpen, hideLogin } = props
  const { t } = useTranslation()

  const history = useHistory()
  const selfUser = useAuthState().user

  const [username, setUsername] = useState(selfUser?.name.value)
  const [emailPhone, setEmailPhone] = useState('')
  const [error, setError] = useState(false)
  const [errorUsername, setErrorUsername] = useState(false)
  const [modal, setModal] = useState(false)

  const userId = selfUser.id.value!

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
      AuthService.updateUsername(userId, name)
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
    if (type === 'email') AuthService.addConnectionByEmail(emailPhone, userId)
    else if (type === 'sms') AuthService.addConnectionBySms(emailPhone, userId)
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

  return (
    <>
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
              <h2>
                {selfUser?.userRole?.value === 'admin'
                  ? t('user:usermenu.profile.youAreAn')
                  : t('user:usermenu.profile.youAreA')}{' '}
                <span>{selfUser?.userRole?.value}</span>.
              </h2>
              <h4>
                {(selfUser.userRole.value === 'user' || selfUser.userRole.value === 'admin') && (
                  <div onClick={handleLogout}>{t('user:usermenu.profile.logout')}</div>
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
          {!hideLogin && (
            <>
              {selfUser?.userRole.value === 'guest' && (
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

              {selfUser?.userRole.value === 'guest' && (
                <section className={styles.socialBlock}>
                  <Typography variant="h3" className={styles.textBlock}>
                    {t('user:usermenu.profile.connectSocial')}
                  </Typography>
                  <div className={styles.socialContainer}>
                    <a href="#" id="google" onClick={handleOAuthServiceClick}>
                      <GoogleIcon width="40" height="40" viewBox="0 0 40 40" />
                    </a>
                    <a href="#" id="facebook" onClick={handleOAuthServiceClick}>
                      <FacebookIcon width="40" height="40" viewBox="0 0 40 40" />
                    </a>
                    <a href="#" id="linkedin2" onClick={handleOAuthServiceClick}>
                      <LinkedInIcon width="40" height="40" viewBox="0 0 40 40" />
                    </a>
                    <a href="#" id="twitter" onClick={handleOAuthServiceClick}>
                      <TwitterIcon width="40" height="40" viewBox="0 0 40 40" />
                    </a>
                    <a href="#" id="github" onClick={handleOAuthServiceClick}>
                      <GitHub />
                    </a>
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
      </div>
      <Dialog
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        open={modal}
        maxWidth="sm"
        fullWidth
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ pr: 2 }}>
          <DialogTitle>Inventory</DialogTitle>
          <IconButton onClick={() => setModal(false)}>
            <Cancel />
          </IconButton>
        </Stack>
        <DialogContent>
          <Stack>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              {/* <LoadingButton
                        variant="contained"
                        color="secondary"
                        onClick={() => handleCancelpaylink(row.id, index)}
                        loading={iscancelloading}
                      >
                        Yes
                      </LoadingButton>
                      <LoadingButton
                        variant="outlined"
                        color="error"
                        onClick={() => setCancelmodal(false)}
                        loading={iscancelloading}
                      >
                        No
                      </LoadingButton> */}
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ProfileMenu
