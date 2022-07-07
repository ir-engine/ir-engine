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
import XRIconButton from '../../components/XRIconButton'
import XRInput from '../../components/XRInput'
import XRTextButton from '../../components/XRTextButton'
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
    setWidgetVisibility('SelectAvatar', true)
  }

  const handleOpenReadyPlayerWidget = () => {
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
              <XRIconButton
                size="large"
                xr-layer="true"
                className="avatarBtn"
                id="select-avatar"
                onClick={handleOpenSelectAvatarWidget}
                content={<Create />}
              />
            </div>
            <div className="headerBlock">
              <h1 className="panelHeader">{t('user:usermenu.profile.lbl-username')}</h1>
              <XRInput
                aria-invalid="false"
                type="text"
                value={username || ''}
                onChange={handleUsernameChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') updateUserName(e)
                }}
                endIcon={<Check />}
                endIconClick={updateUserName}
              />
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
              <XRInput
                aria-invalid="false"
                disabled={true}
                type="text"
                value={userId}
                endIcon={<ContentCopyIcon />}
                endIconClick={() => {
                  navigator.clipboard.writeText(userId)
                  NotificationService.dispatchNotify('User ID copied', {
                    variant: 'success'
                  })
                }}
              />
            </section>
          )}

          {showApiKey && (
            <section className="emailPhoneSection">
              <h1 className="panelHeader">{t('user:usermenu.profile.apiKey')}</h1>
              <XRInput
                aria-invalid="false"
                disabled={true}
                type="text"
                value={apiKey}
                endIcon={<ContentCopyIcon />}
                endIconClick={() => {
                  navigator.clipboard.writeText(apiKey)
                  NotificationService.dispatchNotify('API Key copied', {
                    variant: 'success'
                  })
                }}
              />
            </section>
          )}

          {userRole === 'guest' && enableConnect && (
            <section className="emailPhoneSection">
              <h1 className="panelHeader">{getConnectText()}</h1>
              <XRInput
                aria-invalid="false"
                type="text"
                value={apiKey}
                placeholder={getConnectPlaceholder()}
                onChange={handleInputChange}
                onBlur={validate}
                endIcon={<ContentCopyIcon />}
                endIconClick={handleGuestSubmit}
              />
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
              <XRTextButton
                variant="gradient"
                xr-layer="true"
                onClick={handleOpenReadyPlayerWidget}
                className="walletBtn"
                content={t('user:usermenu.profile.loginWithReadyPlayerMe')}
              />
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
