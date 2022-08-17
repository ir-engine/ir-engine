import { Ed25519Signature2020 } from '@digitalcredentials/ed25519-signature-2020'
import { useHookstate } from '@hookstate/core'
import * as polyfill from 'credential-handler-polyfill'
import React, { useEffect, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { validateEmail, validatePhoneNumber } from '@xrengine/common/src/config'
import { defaultThemeModes, defaultThemeSettings } from '@xrengine/common/src/constants/DefaultThemeSettings'
import { generateDid, IKeyPairDescription, issueCredential } from '@xrengine/common/src/identity'
import multiLogger from '@xrengine/common/src/logger'
import capitalizeFirstLetter from '@xrengine/common/src/utils/capitalizeFirstLetter'
import { AudioEffectPlayer } from '@xrengine/engine/src/audio/systems/AudioSystem'
import { WorldState } from '@xrengine/engine/src/networking/interfaces/WorldState'
import { getState } from '@xrengine/hyperflux'

import { Check, Create, GitHub, Send } from '@mui/icons-material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import RefreshIcon from '@mui/icons-material/Refresh'
import SettingsIcon from '@mui/icons-material/Settings'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import InputSelect, { InputMenuItem } from '../../../../admin/common/InputSelect'
import { useAuthSettingState } from '../../../../admin/services/Setting/AuthSettingService'
import { useClientSettingState } from '../../../../admin/services/Setting/ClientSettingService'
import { DiscordIcon } from '../../../../common/components/Icons/DiscordIcon'
import { FacebookIcon } from '../../../../common/components/Icons/FacebookIcon'
import { GoogleIcon } from '../../../../common/components/Icons/GoogleIcon'
import { LinkedInIcon } from '../../../../common/components/Icons/LinkedInIcon'
import { TwitterIcon } from '../../../../common/components/Icons/TwitterIcon'
import { initialAuthState, initialOAuthConnectedState } from '../../../../common/initialAuthState'
import { NotificationService } from '../../../../common/services/NotificationService'
import { AuthService, useAuthState } from '../../../services/AuthService'
import { userHasAccess } from '../../../userHasAccess'
import styles from '../index.module.scss'
import { getAvatarURLForUser, Views } from '../util'

const logger = multiLogger.child({ component: 'client-core:ProfileMenu' })

interface Props {
  className?: string
  hideLogin?: boolean
  isPopover?: boolean
  changeActiveMenu?: (type: string | null) => void
  onClose?: () => void
}

const ProfileMenu = ({ className, hideLogin, isPopover, changeActiveMenu, onClose }: Props): JSX.Element => {
  const { t } = useTranslation()
  const location = useLocation()

  const selfUser = useAuthState().user

  const [username, setUsername] = useState(selfUser?.name.value)
  const [emailPhone, setEmailPhone] = useState('')
  const [error, setError] = useState(false)
  const [errorUsername, setErrorUsername] = useState(false)
  const [showUserId, setShowUserId] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [oauthConnectedState, setOauthConnectedState] = useState(initialOAuthConnectedState)
  const [deleteControlsOpen, setDeleteControlsOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [authState, setAuthState] = useState(initialAuthState)

  const authSettingState = useAuthSettingState()
  const [authSetting] = authSettingState?.authSettings?.value || []
  const loading = useAuthState().isProcessing.value
  const userSettings = selfUser.user_setting.value
  const userId = selfUser.id.value
  const apiKey = selfUser.apiKey?.token?.value
  const isGuest = selfUser.isGuest.value

  const clientSettingState = useClientSettingState()
  const [clientSetting] = clientSettingState?.client?.value || []

  const hasAdminAccess =
    selfUser?.id?.value?.length > 0 && selfUser?.scopes?.value?.find((scope) => scope.type === 'admin:admin')
  const hasEditorAccess = userHasAccess('editor:write')

  const userAvatarDetails = useHookstate(getState(WorldState).userAvatarDetails)

  const themeModes = { ...defaultThemeModes, ...userSettings?.themeModes }
  const themeSettings = { ...defaultThemeSettings, ...clientSetting.themeSettings }

  const accessibleThemeModes = Object.keys(themeModes).filter((mode) => {
    if (mode === 'admin' && !hasAdminAccess) {
      return false
    } else if (mode === 'editor' && !hasEditorAccess) {
      return false
    }
    return true
  })

  const colorModesMenu: InputMenuItem[] = Object.keys(themeSettings).map((el) => {
    return {
      label: capitalizeFirstLetter(el),
      value: el
    }
  })

  useEffect(() => {
    if (authSetting) {
      let temp = { ...initialAuthState }
      authSetting?.authStrategies?.forEach((el) => {
        Object.entries(el).forEach(([strategyName, strategy]) => {
          temp[strategyName] = strategy
        })
      })
      setAuthState(temp)
    }
  }, [authSettingState?.updateNeeded?.value])

  /**
   * Note: If you're editing this function, be sure to make the same changes to
   * the XRUI version over at packages/client-core/src/systems/ui/ProfileDetailView/index.tsx
   * @param event
   */
  const handleChangeUserThemeMode = (event) => {
    const { name, value } = event.target

    const settings = { ...userSettings, themeModes: { ...themeModes, [name]: value } }
    userSettings && AuthService.updateUserSettings(userSettings.id as string, settings)
  }
  let type = ''
  const addMoreSocial =
    (authState?.discord && !oauthConnectedState.discord) ||
    (authState.facebook && !oauthConnectedState.facebook) ||
    (authState.github && !oauthConnectedState.github) ||
    (authState.google && !oauthConnectedState.google) ||
    (authState.linkedin && !oauthConnectedState.linkedin) ||
    (authState.twitter && !oauthConnectedState.twitter)

  const removeSocial =
    (authState?.discord && oauthConnectedState.discord) ||
    (authState.facebook && oauthConnectedState.facebook) ||
    (authState.github && oauthConnectedState.github) ||
    (authState.google && oauthConnectedState.google) ||
    (authState.linkedin && oauthConnectedState.linkedin) ||
    (authState.twitter && oauthConnectedState.twitter)

  const loadCredentialHandler = async () => {
    try {
      const mediator =
        globalThis.process.env['VITE_MEDIATOR_SERVER'] +
        `/mediator?origin=${encodeURIComponent(window.location.origin)}`

      await polyfill.loadOnce(mediator)
      console.log('Ready to work with credentials!')
    } catch (e) {
      logger.error(e, 'Error loading polyfill')
    }
  }

  useEffect(() => {
    loadCredentialHandler()
  }, []) // Only run once

  useEffect(() => {
    selfUser && setUsername(selfUser.name.value)
  }, [selfUser.name.value])

  useEffect(() => {
    setOauthConnectedState(initialOAuthConnectedState)
    if (selfUser.identityProviders.value)
      for (let ip of selfUser.identityProviders.value) {
        switch (ip.type) {
          case 'discord':
            setOauthConnectedState((oauthConnectedState) => {
              return { ...oauthConnectedState, discord: true }
            })
            break
          case 'facebook':
            setOauthConnectedState((oauthConnectedState) => {
              return { ...oauthConnectedState, facebook: true }
            })
            break
          case 'linkedin':
            setOauthConnectedState((oauthConnectedState) => {
              return { ...oauthConnectedState, linkedin: true }
            })
            break
          case 'google':
            setOauthConnectedState((oauthConnectedState) => {
              return { ...oauthConnectedState, google: true }
            })
            break
          case 'twitter':
            setOauthConnectedState((oauthConnectedState) => {
              return { ...oauthConnectedState, twitter: true }
            })
            break
          case 'github':
            setOauthConnectedState((oauthConnectedState) => {
              return { ...oauthConnectedState, github: true }
            })
            break
        }
      }
  }, [selfUser.identityProviders])

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
      // @ts-ignore
      AuthService.updateUsername(userId, name)
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

  const handleGuestSubmit = (e: any): any => {
    e.preventDefault()
    if (!validate()) return
    if (type === 'email') AuthService.createMagicLink(emailPhone, authState, 'email')
    else if (type === 'sms') AuthService.createMagicLink(emailPhone, authState, 'sms')
    return
  }

  const handleOAuthServiceClick = (e) => {
    AuthService.loginUserByOAuth(e.currentTarget.id, location)
  }

  const handleRemoveOAuthServiceClick = (e) => {
    AuthService.removeUserOAuth(e.currentTarget.id)
  }

  const handleLogout = async (e) => {
    if (changeActiveMenu != null) changeActiveMenu(null)
    else if (onClose != null) onClose()
    setShowUserId(false)
    setShowApiKey(false)
    await AuthService.logoutUser()
    // window.location.reload()
  }

  /**
   * Example function, issues a Verifiable Credential, and uses the Credential
   * Handler API (CHAPI) to request to store this VC in the user's wallet.
   *
   * This is here in the ProfileMenu just for convenience -- it can be invoked
   * by the engine whenever appropriate (whenever a user performs some in-engine action,
   * makes a payment, etc).
   */
  async function handleIssueCredentialClick() {
    // Typically, this would be loaded directly from an env var (or other secret mgmt mechanism)
    // And used to bootstrap a client into a hardware KMS (Key Management System)
    // In this example, the secret seed is provided directly (obviously, don't do this)
    const CREDENTIAL_SIGNING_SECRET_KEY_SEED = 'z1AZK4h5w5YZkKYEgqtcFfvSbWQ3tZ3ZFgmLsXMZsTVoeK7'

    // Generate a DID Document and corresponding key pairs from the seed
    const { didDocument, methodFor } = await generateDid(CREDENTIAL_SIGNING_SECRET_KEY_SEED)

    // 'methodFor' serves as a wrapper/getter method for public/private key pairs
    // that were generated as a result of DID Doc creation.
    // It's a way to fetch keys not by ID (since that's quite opaque/random) but
    // by their usage purpose -- assertionMethod (for signing VCs), authentication (for DID Auth),
    // keyAgreement (for encrypting), etc.
    const key = methodFor({ purpose: 'assertionMethod' }) as IKeyPairDescription

    // This would typically be the Ethereal Engine's own DID, generated and cached at
    // startup from a secret.
    const issuer = didDocument.id

    // TODO: Extract from the logged in user's session
    const userDid = 'did:example:user:1234'

    const suite = new Ed25519Signature2020({ key })

    // Example VC that denotes that a user has entered a door / 3d volume
    const unsignedCredential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        // The object below is a temporary (in-line) context, used for an example
        // Once we settle on what our VC content is (what types we want to issue, etc)
        // We'll fold them all into the 'https://w3id.org/xr/v1' context
        {
          etherealEvent: 'https://w3id.org/xr/v1#etherealEvent',
          EnteredVolumeEvent: 'https://w3id.org/xr/v1#EnteredVolumeEvent',
          CheckpointEvent: 'https://w3id.org/xr/v1#CheckpointEvent',
          checkpointId: 'https://w3id.org/xr/v1#checkpointId'
        }
      ],
      type: ['VerifiableCredential'],
      issuer,
      issuanceDate: '2022-01-01T19:23:24Z',
      credentialSubject: {
        id: userDid,
        etherealEvent: [
          {
            type: ['EnteredVolumeEvent', 'CheckpointEvent'],
            checkpointId: '12345'
          }
        ]
      }
    }

    const signedVc = await issueCredential(unsignedCredential, suite)

    console.log('Issued VC:', JSON.stringify(signedVc, null, 2))

    // Wrap the VC in an unsigned Verifiable Presentation
    const vp = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: 'VerifiablePresentation',
      verifiableCredential: [signedVc]
    }

    const webCredentialType = 'VerifiablePresentation'
    // @ts-ignore
    const webCredentialWrapper = new window.WebCredential(webCredentialType, vp, {
      // recommendedHandlerOrigins: []
    })

    // Use Credential Handler API to store
    const result = await navigator.credentials.store(webCredentialWrapper)

    console.log('Result of receiving via store() request:', result)
  }

  async function handleRequestCredentialClick() {
    const vcRequestQuery: any = {
      web: {
        VerifiablePresentation: {
          query: [
            {
              type: 'QueryByExample',
              credentialQuery: [
                {
                  example: {
                    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/xr/v1'],
                    type: 'VerifiableCredential'
                  }
                }
              ]
            }
          ]
        }
      }
    }

    const result = await navigator.credentials.get(vcRequestQuery)

    console.log('VC Request query result:', result)
  }

  async function handleWalletLoginClick() {
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

    // Use Credential Handler API to authenticate and receive basic login display credentials
    const vprResult: any = await navigator.credentials.get(didAuthQuery)
    console.log(vprResult)

    AuthService.loginUserByXRWallet(vprResult)
  }

  const refreshApiKey = () => {
    AuthService.updateApiKey()
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

  const goToEthNFT = () => {
    let token = JSON.stringify(localStorage.getItem('TheOverlay-Auth-Store'))
    if (userId && token)
      window.open(`${globalThis.process.env['VITE_ETH_MARKETPLACE']}?data=${userId}&token=${token}`, '_blank')
  }

  const enableWalletLogin = !!globalThis.process.env['VITE_LOGIN_WITH_WALLET']

  const enableSocial =
    authState?.discord ||
    authState?.facebook ||
    authState?.github ||
    authState?.google ||
    authState?.linkedin ||
    authState?.twitter

  const enableConnect = authState?.emailMagicLink || authState?.smsMagicLink

  return (
    <div className={(isPopover ? styles.profilePanelRoot : styles.menuPanel) + (className ? ' ' + className : '')}>
      <section className={styles.profilePanel}>
        <section className={styles.profileBlock}>
          <div className={styles.avatarBlock}>
            <img src={getAvatarURLForUser(userAvatarDetails, userId)} alt="" crossOrigin="anonymous" />
            {changeActiveMenu != null && (
              <Button
                className={styles.avatarBtn}
                id="select-avatar"
                onClick={() => changeActiveMenu(Views.AvatarSelect)}
                onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                disableRipple
              >
                <Create />
              </Button>
            )}
          </div>

          <div className={styles.headerBlock}>
            <Grid container justifyContent="left" direction="row" className={styles.justify}>
              <Grid item xs={12}>
                <h2>
                  {hasAdminAccess ? t('user:usermenu.profile.youAreAn') : t('user:usermenu.profile.youAreA')}
                  <span id="user-role">{hasAdminAccess ? ' Admin' : isGuest ? ' Guest' : ' User'}</span>.
                </h2>
              </Grid>
              <Grid item xs={12} alignItems="flex-start">
                <Tooltip
                  title={showUserId ? t('user:usermenu.profile.hideUserId') : t('user:usermenu.profile.showUserId')}
                  placement="left"
                >
                  <h2
                    className={styles.showUserId}
                    id="show-user-id"
                    onClick={() => setShowUserId(!showUserId)}
                    onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                    onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                  >
                    {showUserId ? t('user:usermenu.profile.hideUserId') : t('user:usermenu.profile.showUserId')}
                  </h2>
                </Tooltip>
              </Grid>
              {selfUser?.apiKey?.id && (
                <Grid item xs={12} alignItems="flex-start">
                  <Tooltip
                    title={showApiKey ? t('user:usermenu.profile.hideApiKey') : t('user:usermenu.profile.showApiKey')}
                    placement="left"
                  >
                    <h2
                      className={styles.showUserId}
                      onClick={() => setShowApiKey(!showApiKey)}
                      onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                      onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                    >
                      {showApiKey ? t('user:usermenu.profile.hideApiKey') : t('user:usermenu.profile.showApiKey')}
                    </h2>
                  </Tooltip>
                </Grid>
              )}
            </Grid>

            {!isGuest && (
              <Grid
                display="grid"
                gridTemplateColumns="1fr 1.5fr"
                xs={12}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.5fr',

                  '@media(max-width: 600px)': {
                    gridTemplateColumns: '1fr'
                  },

                  button: {
                    margin: '0px',
                    width: '100%',
                    height: '100%',
                    color: 'white',
                    display: 'grid',
                    fontSize: '14px',
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    gridTemplateColumns: 'max-content auto',

                    svg: {
                      marginRight: '10px'
                    }
                  }
                }}
              />
            )}
            <h4>
              {
                <div
                  className={styles.logout}
                  onClick={handleLogout}
                  onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                  onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                >
                  {t('user:usermenu.profile.logout')}
                </div>
              }
            </h4>
            {selfUser?.inviteCode.value != null && (
              <h2>
                {t('user:usermenu.profile.inviteCode')}: {selfUser.inviteCode.value}
              </h2>
            )}
          </div>
          {changeActiveMenu && (
            <Button className={styles.avatarBlock} style={{ marginRight: '0px', background: 'var(--textColor)' }}>
              <SettingsIcon
                style={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  margin: 'auto',
                  color: 'var(--inputBackground)'
                }}
                id="settings"
                onClick={() => changeActiveMenu(Views.Settings)}
                onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
              />
            </Button>
          )}
        </section>

        <section className={styles.profileBlock}>
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
                      <a
                        href="#"
                        className={styles.materialIconBlock}
                        onClick={updateUserName}
                        onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                        onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                      >
                        <Check className={styles.primaryForeground} />
                      </a>
                    </InputAdornment>
                  )
                }}
              />
            </span>
          </div>
        </section>

        {showUserId && (
          <section className={styles.emailPhoneSection}>
            <div className={styles.headerBlock}>
              <Typography variant="h1" className={styles.panelHeader}>
                {t('user:usermenu.profile.userIcon.userId')}
              </Typography>

              <form>
                <TextField
                  id="user-id"
                  className={styles.emailField}
                  size="small"
                  placeholder={'user id'}
                  variant="outlined"
                  value={userId}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <CopyToClipboard
                          text={userId}
                          onCopy={() => {
                            NotificationService.dispatchNotify('User ID copied', {
                              variant: 'success'
                            })
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
            </div>
          </section>
        )}

        {showApiKey && (
          <section className={styles.emailPhoneSection}>
            <div className={styles.headerBlock}>
              <Typography variant="h1" className={styles.panelHeader}>
                {t('user:usermenu.profile.apiKey')}
              </Typography>

              <form>
                <TextField
                  className={styles.emailField}
                  size="small"
                  placeholder={'API key'}
                  variant="outlined"
                  value={apiKey}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <RefreshIcon
                          className={styles.apiRefresh}
                          onClick={refreshApiKey}
                          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <CopyToClipboard
                          text={apiKey}
                          onCopy={() => {
                            NotificationService.dispatchNotify('API Key copied', {
                              variant: 'success'
                            })
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
            </div>
          </section>
        )}

        {!hideLogin && (
          <>
            {isGuest && enableConnect && (
              <section className={styles.emailPhoneSection}>
                <Typography variant="h1" className={styles.panelHeader}>
                  {getConnectText()}
                </Typography>

                <form onSubmit={handleGuestSubmit}>
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
                        <InputAdornment
                          position="end"
                          onClick={handleGuestSubmit}
                          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                        >
                          <a href="#" className={styles.materialIconBlock}>
                            <Send className={styles.primaryForeground} />
                          </a>
                        </InputAdornment>
                      )
                    }}
                  />
                  {loading && (
                    <div className={styles.container}>
                      <CircularProgress size={30} />
                    </div>
                  )}
                </form>
              </section>
            )}
            {isGuest && enableWalletLogin && (
              <section className={styles.walletSection}>
                <Typography variant="h1" className={styles.textBlock}>
                  {t('user:usermenu.profile.or')}
                </Typography>

                {enableWalletLogin && (
                  <div>
                    <Button
                      onClick={() => handleWalletLoginClick()}
                      className={styles.walletBtn}
                      onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                      onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                    >
                      {t('user:usermenu.profile.loginWithXRWallet')}
                    </Button>

                    <Button
                      onClick={() => handleIssueCredentialClick()}
                      className={styles.walletBtn}
                      onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                      onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                    >
                      Issue a VC
                    </Button>

                    <Button
                      onClick={() => handleRequestCredentialClick()}
                      className={styles.walletBtn}
                      onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                      onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                    >
                      Request a VC
                    </Button>
                  </div>
                )}
              </section>
            )}

            {enableSocial && (
              <section className={styles.socialBlock}>
                {selfUser?.isGuest.value && (
                  <Typography variant="h1" className={styles.panelHeader}>
                    {t('user:usermenu.profile.addSocial')}
                  </Typography>
                )}
                <div className={styles.socialContainer}>
                  {authState?.discord && !oauthConnectedState.discord && (
                    <a
                      href="#"
                      id="discord"
                      onClick={handleOAuthServiceClick}
                      onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                      onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                    >
                      <DiscordIcon width="40" height="40" viewBox="0 0 40 40" />
                    </a>
                  )}
                  {authState?.google && !oauthConnectedState.google && (
                    <a
                      href="#"
                      id="google"
                      onClick={handleOAuthServiceClick}
                      onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                      onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                    >
                      <GoogleIcon width="40" height="40" viewBox="0 0 40 40" />
                    </a>
                  )}
                  {authState?.facebook && !oauthConnectedState.facebook && (
                    <a
                      href="#"
                      id="facebook"
                      onClick={handleOAuthServiceClick}
                      onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                      onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                    >
                      <FacebookIcon width="40" height="40" viewBox="0 0 40 40" />
                    </a>
                  )}
                  {authState?.linkedin && !oauthConnectedState.linkedin && (
                    <a
                      href="#"
                      id="linkedin"
                      onClick={handleOAuthServiceClick}
                      onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                      onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                    >
                      <LinkedInIcon width="40" height="40" viewBox="0 0 40 40" />
                    </a>
                  )}
                  {authState?.twitter && !oauthConnectedState.twitter && (
                    <a
                      href="#"
                      id="twitter"
                      onClick={handleOAuthServiceClick}
                      onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                      onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                    >
                      <TwitterIcon width="40" height="40" viewBox="0 0 40 40" />
                    </a>
                  )}
                  {authState?.github && !oauthConnectedState.github && (
                    <a
                      href="#"
                      id="github"
                      onClick={handleOAuthServiceClick}
                      onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                      onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                    >
                      <GitHub />
                    </a>
                  )}
                </div>
                {!selfUser?.isGuest.value && removeSocial && (
                  <Typography variant="h3" className={styles.textBlock}>
                    {t('user:usermenu.profile.removeSocial')}
                  </Typography>
                )}
                <div className={styles.socialContainer}>
                  {authState?.discord && oauthConnectedState.discord && (
                    <a
                      href="#"
                      id="discord"
                      onClick={handleRemoveOAuthServiceClick}
                      onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                      onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                    >
                      <DiscordIcon width="40" height="40" viewBox="0 0 40 40" />
                    </a>
                  )}
                  {authState?.google && oauthConnectedState.google && (
                    <a
                      href="#"
                      id="google"
                      onClick={handleRemoveOAuthServiceClick}
                      onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                      onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                    >
                      <GoogleIcon width="40" height="40" viewBox="0 0 40 40" />
                    </a>
                  )}
                  {authState?.facebook && oauthConnectedState.facebook && (
                    <a
                      href="#"
                      id="facebook"
                      onClick={handleRemoveOAuthServiceClick}
                      onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                      onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                    >
                      <FacebookIcon width="40" height="40" viewBox="0 0 40 40" />
                    </a>
                  )}
                  {authState?.linkedin && oauthConnectedState.linkedin && (
                    <a
                      href="#"
                      id="linkedin"
                      onClick={handleRemoveOAuthServiceClick}
                      onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                      onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                    >
                      <LinkedInIcon width="40" height="40" viewBox="0 0 40 40" />
                    </a>
                  )}
                  {authState?.twitter && oauthConnectedState.twitter && (
                    <a
                      href="#"
                      id="twitter"
                      onClick={handleRemoveOAuthServiceClick}
                      onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                      onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                    >
                      <TwitterIcon width="40" height="40" viewBox="0 0 40 40" />
                    </a>
                  )}
                  {authState?.github && oauthConnectedState.github && (
                    <a
                      href="#"
                      id="github"
                      onClick={handleRemoveOAuthServiceClick}
                      onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                      onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                    >
                      <GitHub />
                    </a>
                  )}
                </div>
              </section>
            )}

            {selfUser && (
              <div className={styles.themeSettingContainer}>
                <Grid container spacing={{ xs: 0, sm: 2 }} sx={{ mt: 2 }}>
                  {accessibleThemeModes.map((mode, index) => (
                    <Grid key={index} item xs={12} md={4}>
                      <InputSelect
                        name={mode}
                        label={`${t(`user:usermenu.setting.${mode}`)} ${t('user:usermenu.setting.theme')}`}
                        value={themeModes[mode]}
                        menu={colorModesMenu}
                        onChange={(e) => handleChangeUserThemeMode(e)}
                        onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                        onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </div>
            )}

            <section className={styles.deletePanel}>
              {
                <div>
                  <h2
                    className={styles.deleteAccount}
                    id="delete-account"
                    onClick={() => {
                      setDeleteControlsOpen(!deleteControlsOpen)
                      setConfirmDeleteOpen(false)
                    }}
                    onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                    onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                  >
                    {t('user:usermenu.profile.delete.deleteAccount')}
                  </h2>
                  {deleteControlsOpen && !confirmDeleteOpen && (
                    <div className={styles.deleteContainer}>
                      <h3 className={styles.deleteText}>{t('user:usermenu.profile.delete.deleteControlsText')}</h3>
                      <Button
                        className={styles.deleteCancelButton}
                        onClick={() => setDeleteControlsOpen(false)}
                        onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                        onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                      >
                        {t('user:usermenu.profile.delete.deleteControlsCancel')}
                      </Button>
                      <Button
                        className={styles.deleteConfirmButton}
                        onClick={() => {
                          setDeleteControlsOpen(false)
                          setConfirmDeleteOpen(true)
                        }}
                        onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                        onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                      >
                        {t('user:usermenu.profile.delete.deleteControlsConfirm')}
                      </Button>
                    </div>
                  )}
                  {confirmDeleteOpen && (
                    <div className={styles.deleteContainer}>
                      <h3 className={styles.deleteText}>{t('user:usermenu.profile.delete.finalDeleteText')}</h3>
                      <Button
                        className={styles.deleteConfirmButton}
                        onClick={() => {
                          AuthService.removeUser(userId)
                          AuthService.logoutUser()
                          setConfirmDeleteOpen(false)
                        }}
                        onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                        onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                      >
                        {t('user:usermenu.profile.delete.finalDeleteConfirm')}
                      </Button>
                      <Button className={styles.deleteCancelButton} onClick={() => setConfirmDeleteOpen(false)}>
                        {t('user:usermenu.profile.delete.finalDeleteCancel')}
                      </Button>
                    </div>
                  )}
                </div>
              }
            </section>
          </>
        )}
      </section>
    </div>
  )
}

export default ProfileMenu
