import { createState, useHookstate } from '@hookstate/core'
// import * as polyfill from 'credential-handler-polyfill'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import config, { validateEmail, validatePhoneNumber } from '@etherealengine/common/src/config'
import { defaultThemeModes, defaultThemeSettings } from '@etherealengine/common/src/constants/DefaultThemeSettings'
import multiLogger from '@etherealengine/common/src/logger'
import { WorldState } from '@etherealengine/engine/src/networking/interfaces/WorldState'
import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { WidgetAppService } from '@etherealengine/engine/src/xrui/WidgetAppService'
import { WidgetName } from '@etherealengine/engine/src/xrui/Widgets'
import { getState } from '@etherealengine/hyperflux'
import CircularProgress from '@etherealengine/ui/src/CircularProgress'
import Icon from '@etherealengine/ui/src/Icon'
import IconButton from '@etherealengine/ui/src/IconButton'

import { useAuthSettingState } from '../../../admin/services/Setting/AuthSettingService'
import { useClientSettingState } from '../../../admin/services/Setting/ClientSettingService'
import { DiscordIcon } from '../../../common/components/Icons/DiscordIcon'
import { FacebookIcon } from '../../../common/components/Icons/FacebookIcon'
import { GoogleIcon } from '../../../common/components/Icons/GoogleIcon'
import { LinkedInIcon } from '../../../common/components/Icons/LinkedInIcon'
import { TwitterIcon } from '../../../common/components/Icons/TwitterIcon'
import { initialAuthState, initialOAuthConnectedState } from '../../../common/initialAuthState'
import { NotificationService } from '../../../common/services/NotificationService'
import { getAvatarURLForUser } from '../../../user/components/UserMenu/util'
import { AuthService, useAuthState } from '../../../user/services/AuthService'
import { userHasAccess } from '../../../user/userHasAccess'
import XRIconButton from '../../components/XRIconButton'
import XRInput from '../../components/XRInput'
import XRSelectDropdown from '../../components/XRSelectDropdown'
import XRTextButton from '../../components/XRTextButton'
import styleString from './index.scss?inline'

const logger = multiLogger.child({ component: 'client-core:ProfileDetailView' })

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
  const [showUserId, setShowUserId] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const authSettingState = useAuthSettingState()
  const [authSetting] = authSettingState?.authSettings?.value || []
  const [authState, setAuthState] = useState(initialAuthState)
  const loading = useAuthState().isProcessing.value
  const userSettings = selfUser.user_setting.value
  const userId = selfUser.id.value
  const apiKey = selfUser.apiKey?.token?.value
  const isGuest = selfUser.isGuest.value
  const isAdmin = selfUser.scopes?.value?.find((scope) => scope.type === 'admin')
  const [deleteControlsOpen, setDeleteControlsOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [oauthConnectedState, setOauthConnectedState] = useState(initialOAuthConnectedState)
  const userAvatarDetails = useHookstate(getState(WorldState).userAvatarDetails)

  const clientSettingState = useClientSettingState()
  const [clientSetting] = clientSettingState?.client?.value || []

  const hasAdminAccess =
    selfUser?.id?.value?.length > 0 && selfUser?.scopes?.value?.find((scope) => scope.type === 'admin:admin')
  const hasEditorAccess = userHasAccess('editor:write')

  const themeModes = { ...defaultThemeModes, ...userSettings?.themeModes }
  const themeSettings = { ...defaultThemeSettings, ...clientSetting.themeSettings }

  const accessibleThemeModes = Object.keys(themeModes).filter((mode) => {
    if (mode === 'admin' && hasAdminAccess === false) {
      return false
    } else if (mode === 'editor' && !hasEditorAccess) {
      return false
    }
    return true
  })

  const colorModesMenu = Object.keys(themeSettings)

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
   * Note: If you're editing lines 75-191, be sure to make the same changes to
   * the non-XRUI version over at packages/client-core/src/user/components/UserMenu/menus/ProfileMenu.tsx
   * @param name
   * @param value
   */
  const handleChangeUserThemeMode = (name, value) => {
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

  // const loadCredentialHandler = async () => {
  //   try {
  //     const mediator = `${config.client.mediatorServer}/mediator?origin=${encodeURIComponent(window.location.origin)}`

  //     await polyfill.loadOnce(mediator)
  //   } catch (e) {
  //     logger.error(e, 'Error loading polyfill')
  //   }
  // }

  // useEffect(() => {
  //   loadCredentialHandler()
  // }, []) // Only run once

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
      return false
    }

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
    WidgetAppService.setWidgetVisibility(WidgetName.PROFILE, false)
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

  const handleOpenSelectAvatarWidget = () => {
    WidgetAppService.setWidgetVisibility(WidgetName.SELECT_AVATAR, true)
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
              <img src={getAvatarURLForUser(userAvatarDetails, userId)} alt="" />
              <XRIconButton
                size="large"
                xr-layer="true"
                className="avatarBtn"
                id="select-avatar"
                onClick={handleOpenSelectAvatarWidget}
                content={<Icon type="Create" />}
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
                endIcon={<Icon type="Check" />}
                endIconClick={updateUserName}
              />
              <div className="detailsContainer">
                <h2>
                  {isAdmin ? t('user:usermenu.profile.youAreAn') : t('user:usermenu.profile.youAreA')}
                  <span id="user-role">{isAdmin ? ' Admin' : isGuest ? ' Guest' : ' User'}</span>.
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
                {!isGuest && (
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
                endIcon={<Icon type="ContentCopy" />}
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
                startIcon={<Icon type="Refresh" />}
                startIconClick={refreshApiKey}
                endIcon={<Icon type="ContentCopy" />}
                endIconClick={() => {
                  navigator.clipboard.writeText(apiKey)
                  NotificationService.dispatchNotify('API Key copied', {
                    variant: 'success'
                  })
                }}
              />
            </section>
          )}

          {isGuest && enableConnect && (
            <section className="emailPhoneSection">
              <h1 className="panelHeader">{getConnectText()}</h1>
              <XRInput
                aria-invalid="false"
                type="text"
                value={apiKey}
                placeholder={getConnectPlaceholder()}
                onChange={handleInputChange}
                onBlur={validate}
                endIcon={<Icon type="ContentCopy" />}
                endIconClick={handleGuestSubmit}
              />
              {loading && (
                <div className="container">
                  <CircularProgress size={30} />
                </div>
              )}
            </section>
          )}

          {enableSocial && (
            <section className="socialBlock">
              {selfUser?.isGuest.value && <h3 className="textBlock">{t('user:usermenu.profile.connectSocial')}</h3>}
              {!selfUser?.isGuest.value && addMoreSocial && (
                <h3 className="textBlock">{t('user:usermenu.profile.addSocial')}</h3>
              )}
              <div className="socialContainer">
                {authState?.discord && !oauthConnectedState.discord && (
                  <IconButton
                    id="discord"
                    onClick={handleOAuthServiceClick}
                    icon={<DiscordIcon width="40" height="40" viewBox="0 0 40 40" />}
                  />
                )}
                {authState?.google && !oauthConnectedState.google && (
                  <IconButton
                    id="google"
                    onClick={handleOAuthServiceClick}
                    icon={<GoogleIcon width="40" height="40" viewBox="0 0 40 40" />}
                  />
                )}
                {authState?.facebook && !oauthConnectedState.facebook && (
                  <IconButton
                    id="facebook"
                    onClick={handleOAuthServiceClick}
                    icon={<FacebookIcon width="40" height="40" viewBox="0 0 40 40" />}
                  />
                )}
                {authState?.linkedin && !oauthConnectedState.linkedin && (
                  <IconButton
                    id="linkedin"
                    onClick={handleOAuthServiceClick}
                    icon={<LinkedInIcon width="40" height="40" viewBox="0 0 40 40" />}
                  />
                )}
                {authState?.twitter && !oauthConnectedState.twitter && (
                  <IconButton
                    id="twitter"
                    onClick={handleOAuthServiceClick}
                    icon={<LinkedInIcon width="40" height="40" viewBox="0 0 40 40" />}
                  />
                )}
                {authState?.github && !oauthConnectedState.github && (
                  <IconButton id="github" onClick={handleOAuthServiceClick} icon={<Icon type="GitHub" />} />
                )}
              </div>
              {!selfUser?.isGuest.value && removeSocial && (
                <h3 className="textBlock">{t('user:usermenu.profile.removeSocial')}</h3>
              )}
              {!selfUser?.isGuest.value && removeSocial && (
                <div className="socialContainer">
                  {authState?.discord && oauthConnectedState.discord && (
                    <IconButton
                      id="discord"
                      onClick={handleRemoveOAuthServiceClick}
                      icon={<DiscordIcon width="40" height="40" viewBox="0 0 40 40" />}
                    />
                  )}
                  {authState?.google && oauthConnectedState.google && (
                    <IconButton
                      id="google"
                      onClick={handleRemoveOAuthServiceClick}
                      icon={<GoogleIcon width="40" height="40" viewBox="0 0 40 40" />}
                    />
                  )}
                  {authState?.facebook && oauthConnectedState.facebook && (
                    <IconButton
                      id="facebook"
                      onClick={handleRemoveOAuthServiceClick}
                      icon={<Icon type="Facebook" width="40" height="40" viewBox="0 0 40 40" />}
                    />
                  )}
                  {authState?.linkedin && oauthConnectedState.linkedin && (
                    <IconButton
                      id="linkedin"
                      onClick={handleRemoveOAuthServiceClick}
                      icon={<LinkedInIcon width="40" height="40" viewBox="0 0 40 40" />}
                    />
                  )}
                  {authState?.twitter && oauthConnectedState.twitter && (
                    <IconButton
                      id="twitter"
                      onClick={handleRemoveOAuthServiceClick}
                      icon={<Icon type="Twitter" width="40" height="40" viewBox="0 0 40 40" />}
                    />
                  )}
                  {authState?.github && oauthConnectedState.github && (
                    <IconButton id="github" onClick={handleRemoveOAuthServiceClick} icon={<Icon type="GitHub" />} />
                  )}
                </div>
              )}
              {selfUser?.isGuest.value && <h4 className="smallTextBlock">{t('user:usermenu.profile.createOne')}</h4>}
            </section>
          )}
        </section>
        <section className="deletePanel">
          {!isGuest && (
            <div>
              <h2
                className="deleteAccount"
                id="delete-account"
                onClick={() => {
                  setDeleteControlsOpen(!deleteControlsOpen)
                  setConfirmDeleteOpen(false)
                }}
              >
                {t('user:usermenu.profile.delete.deleteAccount')}
              </h2>
              {deleteControlsOpen && !confirmDeleteOpen && (
                <div className="deleteContainer">
                  <h3 className="deleteText">{t('user:usermenu.profile.delete.deleteControlsText')}</h3>
                  <div className="deleteButtonContainer">
                    <XRTextButton
                      variant="outlined"
                      content={t('user:usermenu.profile.delete.deleteControlsCancel')}
                      onClick={() => setDeleteControlsOpen(false)}
                    />
                    <XRTextButton
                      variant="gradient"
                      onClick={() => {
                        setDeleteControlsOpen(false)
                        setConfirmDeleteOpen(true)
                      }}
                    >
                      {t('user:usermenu.profile.delete.deleteControlsConfirm')}
                    </XRTextButton>
                  </div>
                </div>
              )}
              {confirmDeleteOpen && (
                <div className="deleteContainer">
                  <h3 className="deleteText">{t('user:usermenu.profile.delete.finalDeleteText')}</h3>
                  <div className="deleteButtonContainer">
                    <XRTextButton
                      variant="gradient"
                      onClick={() => {
                        AuthService.removeUser(userId)
                        AuthService.logoutUser()
                        setConfirmDeleteOpen(false)
                      }}
                    >
                      {t('user:usermenu.profile.delete.finalDeleteConfirm')}
                    </XRTextButton>
                    <XRTextButton variant="outlined" onClick={() => setConfirmDeleteOpen(false)}>
                      {t('user:usermenu.profile.delete.finalDeleteCancel')}
                    </XRTextButton>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {selfUser && (
          <div className="modeSettingContainer">
            <h1 className="modesHeading">{t('user:usermenu.setting.themes')}</h1>
            <div className="modesContainer">
              {accessibleThemeModes.map((mode, index) => (
                <div key={index} className="modeContainer">
                  <h2 className="modeHeading">{`${t(`user:usermenu.setting.${mode}`)} ${t(
                    'user:usermenu.setting.theme'
                  )}`}</h2>
                  <XRSelectDropdown
                    value={themeModes[mode]}
                    options={colorModesMenu}
                    onChange={(value) => handleChangeUserThemeMode(mode, value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ProfileDetailView
