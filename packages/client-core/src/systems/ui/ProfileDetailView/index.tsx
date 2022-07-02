import { createState } from '@speigg/hookstate'
import * as polyfill from 'credential-handler-polyfill'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { validateEmail, validatePhoneNumber } from '@xrengine/common/src/config'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { accessWidgetAppState, WidgetAppActions } from '@xrengine/engine/src/xrui/WidgetAppService'
import { dispatchAction } from '@xrengine/hyperflux'

import { Check, Create, GitHub } from '@mui/icons-material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import RefreshIcon from '@mui/icons-material/Refresh'
import CircularProgress from '@mui/material/CircularProgress'

import { useAuthSettingState } from '../../../admin/services/Setting/AuthSettingService'
import { DiscordIcon } from '../../../common/components/Icons/DiscordIcon'
import { FacebookIcon } from '../../../common/components/Icons/FacebookIcon'
import { GoogleIcon } from '../../../common/components/Icons/GoogleIcon'
import { LinkedInIcon } from '../../../common/components/Icons/LinkedInIcon'
import { TwitterIcon } from '../../../common/components/Icons/TwitterIcon'
import { NotificationService } from '../../../common/services/NotificationService'
import { getAvatarURLForUser } from '../../../user/components/UserMenu/util'
import { AuthService, useAuthState } from '../../../user/services/AuthService'
import styleString from './index.scss'

const initialAuthState = {
  jwt: true,
  local: false,
  discord: false,
  facebook: false,
  github: false,
  google: false,
  linkedin: false,
  twitter: false,
  smsMagicLink: false,
  emailMagicLink: false
}

const initialOAuthConnectedState = {
  discord: false,
  facebook: false,
  github: false,
  google: false,
  linkedin: false,
  twitter: false
}

export function createProfileDetailView() {
  return createXRUI(ProfileDetailView, createProfileDetailState())
}

function createProfileDetailState() {
  return createState({})
}

const ProfileDetailView = () => {
  const { t } = useTranslation()

  const selfUser = useAuthState().user

  const [username, setUsername] = useState(selfUser?.name.value)
  const [emailPhone, setEmailPhone] = useState('')
  const [error, setError] = useState(false)
  const [errorUsername, setErrorUsername] = useState(false)
  const [showUserId, setShowUserId] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const authSettingState = useAuthSettingState()
  const [authSetting] = authSettingState?.authSettings?.value || []
  const [authState, setAuthState] = useState(initialAuthState)
  const loading = useAuthState().isProcessing.value
  const userSettings = selfUser.user_setting.value
  const userId = selfUser.id.value
  const apiKey = selfUser.apiKey?.token?.value
  const userRole = selfUser.userRole.value
  const [oauthConnectedState, setOauthConnectedState] = useState(initialOAuthConnectedState)

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

  const handleChangeUserThemeMode = (event) => {
    const settings = { ...userSettings, themeMode: event.target.checked ? 'dark' : 'light' }
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
      const mediator = `${globalThis.process.env['VITE_MEDIATOR_SERVER']}/mediator?origin=${encodeURIComponent(
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
    AuthService.loginUserByOAuth(e.currentTarget.id, window.location)
  }

  const handleRemoveOAuthServiceClick = (e) => {
    AuthService.removeUserOAuth(e.currentTarget.id)
  }

  const handleLogout = async (e) => {
    setWidgetVisibility('Profile', false)
    setShowUserId(false)
    setShowApiKey(false)
    await AuthService.logoutUser()
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

  const setWidgetVisibility = (widgetName: string, visibility: boolean) => {
    const widgetState = accessWidgetAppState()
    const widgets = Object.entries(widgetState.widgets.value).map(([id, widgetState]) => ({
      id,
      ...widgetState,
      ...Engine.instance.currentWorld.widgets.get(id)!
    }))

    const currentWidget = widgets.find((w) => w.label === widgetName)

    // close currently open widgets until we support multiple widgets being open at once
    for (let widget of widgets) {
      if (currentWidget && widget.id !== currentWidget.id) {
        dispatchAction(WidgetAppActions.showWidget({ id: widget.id, shown: false }))
      }
    }

    currentWidget && dispatchAction(WidgetAppActions.showWidget({ id: currentWidget.id, shown: visibility }))
  }

  const handleOpenSelectAvatarWidget = () => {
    // TODO open select avatar xrui widget menu
    setWidgetVisibility('SelectAvatar', true)
  }

  const handleOpenReadyPlayerWidget = () => {
    // TODO open ready player xrui widget menu
    setWidgetVisibility('ReadyPlayer', true)
  }

  const enableSocial =
    authState?.discord ||
    authState?.facebook ||
    authState?.github ||
    authState?.google ||
    authState?.linkedin ||
    authState?.twitter

  const enableConnect = authState?.emailMagicLink || authState?.smsMagicLink

  return (
    <>
      <style>{styleString}</style>
      <div className="menuPanel">
        <section className="profilePanel">
          <section className="profileBlock">
            <div className="avatarBlock">
              <img src={getAvatarURLForUser(userId)} />
              <button xr-layer="true" className="avatarBtn" id="select-avatar" onClick={handleOpenSelectAvatarWidget}>
                <Create />
              </button>
            </div>
            <div className="headerBlock">
              <h1 className="panelHeader">{t('user:usermenu.profile.lbl-username')}</h1>
              <div className="inviteBox">
                <div className="inviteContainer">
                  <input
                    aria-invalid="false"
                    type="text"
                    className="inviteLinkInput"
                    value={username || ''}
                    onChange={handleUsernameChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') updateUserName(e)
                    }}
                  />

                  <div className="copyInviteContainer" onClick={updateUserName}>
                    <Check className="primaryForeground" />
                  </div>

                  <fieldset aria-hidden="true" className="linkFieldset">
                    <legend className="linkLegend" />
                  </fieldset>
                </div>
              </div>

              <div className="detailsContainer">
                <h2>
                  {userRole === 'admin' ? t('user:usermenu.profile.youAreAn') : t('user:usermenu.profile.youAreA')}
                  <span id="user-role">{` ${userRole}`}</span>.
                </h2>
                <h2 className="showUserId" id="show-user-id" onClick={() => setShowUserId(!showUserId)}>
                  {showUserId ? t('user:usermenu.profile.hideUserId') : t('user:usermenu.profile.showUserId')}
                </h2>
                {selfUser?.apiKey?.id && (
                  <h2 className="showUserId" onClick={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? t('user:usermenu.profile.hideApiKey') : t('user:usermenu.profile.showApiKey')}
                  </h2>
                )}
              </div>

              {selfUser && (
                <div className="themeSettingContainer">
                  <div className="themeHeading">Theme Mode:</div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={userSettings?.themeMode === 'dark'}
                      onChange={handleChangeUserThemeMode}
                    />
                    <span className="switchSlider round">
                      <div className="iconContainer">
                        {userSettings?.themeMode !== 'dark' ? (
                          <svg height="20" width="20" viewBox="0 0 20 20">
                            <path
                              fill="#fff"
                              d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"
                            />
                          </svg>
                        ) : (
                          <svg height="20" width="20" viewBox="0 0 20 20">
                            <path
                              fill="#fff"
                              d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"
                            />
                          </svg>
                        )}
                      </div>
                    </span>
                  </label>
                </div>
              )}
              <h4>
                {userRole !== 'guest' && (
                  <div className="logout" onClick={handleLogout}>
                    {t('user:usermenu.profile.logout')}
                  </div>
                )}
              </h4>
              {selfUser?.inviteCode.value != null && (
                <h2>
                  {t('user:usermenu.profile.inviteCode')}: {selfUser.inviteCode.value}
                </h2>
              )}
            </div>
          </section>

          {showUserId && (
            <section className="emailPhoneSection">
              <h1 className="panelHeader">{t('user:usermenu.profile.userIcon.userId')}</h1>
              <div className="inviteBox">
                <div className="inviteContainer">
                  <input aria-invalid="false" disabled={true} type="text" className="inviteLinkInput" value={userId} />

                  <div
                    className="copyInviteContainer"
                    onClick={() => {
                      navigator.clipboard.writeText(userId)
                      NotificationService.dispatchNotify('User ID copied', {
                        variant: 'success'
                      })
                    }}
                  >
                    <ContentCopyIcon className="primaryForeground" />
                  </div>

                  <fieldset aria-hidden="true" className="linkFieldset">
                    <legend className="linkLegend" />
                  </fieldset>
                </div>
              </div>
            </section>
          )}

          {showApiKey && (
            <section className="emailPhoneSection">
              <h1 className="panelHeader">{t('user:usermenu.profile.apiKey')}</h1>
              <div className="inviteBox">
                <div className="inviteContainer">
                  <div className="refreshApiContainer" onClick={refreshApiKey}>
                    <RefreshIcon className="primaryForeground" />
                  </div>
                  <input aria-invalid="false" disabled={true} type="text" className="inviteLinkInput" value={apiKey} />

                  <div
                    className="copyInviteContainer"
                    onClick={() => {
                      navigator.clipboard.writeText(apiKey)
                      NotificationService.dispatchNotify('API Key copied', {
                        variant: 'success'
                      })
                    }}
                  >
                    <ContentCopyIcon className="primaryForeground" />
                  </div>

                  <fieldset aria-hidden="true" className="linkFieldset">
                    <legend className="linkLegend" />
                  </fieldset>
                </div>
              </div>
            </section>
          )}

          {userRole === 'guest' && enableConnect && (
            <section className="emailPhoneSection">
              <h1 className="panelHeader">{getConnectText()}</h1>
              <div className="inviteBox">
                <div className="inviteContainer">
                  <input
                    aria-invalid="false"
                    type="text"
                    className="inviteLinkInput"
                    value={apiKey}
                    placeholder={getConnectPlaceholder()}
                    onChange={handleInputChange}
                    onBlur={validate}
                  />

                  <div className="copyInviteContainer" onClick={handleGuestSubmit}>
                    <ContentCopyIcon className="primaryForeground" />
                  </div>

                  <fieldset aria-hidden="true" className="linkFieldset">
                    <legend className="linkLegend" />
                  </fieldset>
                </div>
              </div>
              {loading && (
                <div className="container">
                  <CircularProgress size={30} />
                </div>
              )}
            </section>
          )}
          {userRole === 'guest' && (
            <section className="walletSection">
              <h3 className="textBlock">{t('user:usermenu.profile.or')}</h3>
              <button xr-layer="true" onClick={handleOpenReadyPlayerWidget} className="walletBtn">
                {t('user:usermenu.profile.loginWithReadyPlayerMe')}
              </button>
            </section>
          )}

          {enableSocial && (
            <section className="socialBlock">
              {selfUser?.userRole.value === 'guest' && (
                <h3 className="textBlock">{t('user:usermenu.profile.connectSocial')}</h3>
              )}
              {selfUser?.userRole.value !== 'guest' && addMoreSocial && (
                <h3 className="textBlock">{t('user:usermenu.profile.addSocial')}</h3>
              )}
              <div className="socialContainer">
                {authState?.discord && !oauthConnectedState.discord && (
                  <a href="#" id="discord" onClick={handleOAuthServiceClick}>
                    <DiscordIcon width="40" height="40" viewBox="0 0 40 40" />
                  </a>
                )}
                {authState?.google && !oauthConnectedState.google && (
                  <a href="#" id="google" onClick={handleOAuthServiceClick}>
                    <GoogleIcon width="40" height="40" viewBox="0 0 40 40" />
                  </a>
                )}
                {authState?.facebook && !oauthConnectedState.facebook && (
                  <a href="#" id="facebook" onClick={handleOAuthServiceClick}>
                    <FacebookIcon width="40" height="40" viewBox="0 0 40 40" />
                  </a>
                )}
                {authState?.linkedin && !oauthConnectedState.linkedin && (
                  <a href="#" id="linkedin" onClick={handleOAuthServiceClick}>
                    <LinkedInIcon width="40" height="40" viewBox="0 0 40 40" />
                  </a>
                )}
                {authState?.twitter && !oauthConnectedState.twitter && (
                  <a href="#" id="twitter" onClick={handleOAuthServiceClick}>
                    <TwitterIcon width="40" height="40" viewBox="0 0 40 40" />
                  </a>
                )}
                {authState?.github && !oauthConnectedState.github && (
                  <a href="#" id="github" onClick={handleOAuthServiceClick}>
                    <GitHub />
                  </a>
                )}
              </div>
              {selfUser?.userRole.value !== 'guest' && removeSocial && (
                <h3 className="textBlock">{t('user:usermenu.profile.removeSocial')}</h3>
              )}
              <div className="socialContainer">
                {authState?.discord && oauthConnectedState.discord && (
                  <a href="#" id="discord" onClick={handleRemoveOAuthServiceClick}>
                    <DiscordIcon width="40" height="40" viewBox="0 0 40 40" />
                  </a>
                )}
                {authState?.google && oauthConnectedState.google && (
                  <a href="#" id="google" onClick={handleRemoveOAuthServiceClick}>
                    <GoogleIcon width="40" height="40" viewBox="0 0 40 40" />
                  </a>
                )}
                {authState?.facebook && oauthConnectedState.facebook && (
                  <a href="#" id="facebook" onClick={handleRemoveOAuthServiceClick}>
                    <FacebookIcon width="40" height="40" viewBox="0 0 40 40" />
                  </a>
                )}
                {authState?.linkedin && oauthConnectedState.linkedin && (
                  <a href="#" id="linkedin" onClick={handleRemoveOAuthServiceClick}>
                    <LinkedInIcon width="40" height="40" viewBox="0 0 40 40" />
                  </a>
                )}
                {authState?.twitter && oauthConnectedState.twitter && (
                  <a href="#" id="twitter" onClick={handleRemoveOAuthServiceClick}>
                    <TwitterIcon width="40" height="40" viewBox="0 0 40 40" />
                  </a>
                )}
                {authState?.github && oauthConnectedState.github && (
                  <a href="#" id="github" onClick={handleRemoveOAuthServiceClick}>
                    <GitHub />
                  </a>
                )}
              </div>
              {selfUser?.userRole.value === 'guest' && (
                <h4 className="smallTextBlock">{t('user:usermenu.profile.createOne')}</h4>
              )}
            </section>
          )}
        </section>
      </div>
    </>
  )
}

export default ProfileDetailView
