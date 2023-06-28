/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { createState, useHookstate } from '@hookstate/core'
// import * as polyfill from 'credential-handler-polyfill'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { validateEmail, validatePhoneNumber } from '@etherealengine/common/src/config'
import { defaultThemeModes, defaultThemeSettings } from '@etherealengine/common/src/constants/DefaultThemeSettings'
import { WorldState } from '@etherealengine/engine/src/networking/interfaces/WorldState'
import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { WidgetAppService } from '@etherealengine/engine/src/xrui/WidgetAppService'
import { WidgetName } from '@etherealengine/engine/src/xrui/Widgets'
import { getMutableState } from '@etherealengine/hyperflux'
import CircularProgress from '@etherealengine/ui/src/primitives/mui/CircularProgress'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'

import { AuthSettingsState } from '../../../admin/services/Setting/AuthSettingService'
import { AdminClientSettingsState } from '../../../admin/services/Setting/ClientSettingService'
import { DiscordIcon } from '../../../common/components/Icons/DiscordIcon'
import { FacebookIcon } from '../../../common/components/Icons/FacebookIcon'
import { GoogleIcon } from '../../../common/components/Icons/GoogleIcon'
import { LinkedInIcon } from '../../../common/components/Icons/LinkedInIcon'
import { TwitterIcon } from '../../../common/components/Icons/TwitterIcon'
import { initialAuthState, initialOAuthConnectedState } from '../../../common/initialAuthState'
import { NotificationService } from '../../../common/services/NotificationService'
import { getAvatarURLForUser } from '../../../user/components/UserMenu/util'
import { AuthService, AuthState } from '../../../user/services/AuthService'
import { userHasAccess } from '../../../user/userHasAccess'
import XRIconButton from '../../components/XRIconButton'
import XRInput from '../../components/XRInput'
import XRSelectDropdown from '../../components/XRSelectDropdown'
import XRTextButton from '../../components/XRTextButton'
import styleString from './index.scss?inline'

/** @deprecated */
export function createProfileDetailView() {
  return createXRUI(ProfileDetailView, createProfileDetailState())
}

function createProfileDetailState() {
  return createState({})
}

/** @deprecated */
const ProfileDetailView = () => {
  const { t } = useTranslation()

  const extAuthState = useHookstate(getMutableState(AuthState))
  const selfUser = extAuthState?.user

  const username = useHookstate(selfUser?.name.value)
  const emailPhone = useHookstate('')
  const showUserId = useHookstate(false)
  const showApiKey = useHookstate(false)
  const authSettingState = useHookstate(getMutableState(AuthSettingsState))
  const [authSetting] = authSettingState?.authSettings?.value || []
  const authState = useHookstate(initialAuthState)
  const loading = extAuthState.isProcessing.value
  const userSettings = selfUser.user_setting.value
  const userId = selfUser.id.value
  const apiKey = selfUser.apiKey?.token?.value
  const isGuest = selfUser.isGuest.value
  const isAdmin = selfUser.scopes?.value?.find((scope) => scope.type === 'admin')
  const deleteControlsOpen = useHookstate(false)
  const confirmDeleteOpen = useHookstate(false)
  const oauthConnectedState = useHookstate(initialOAuthConnectedState)
  const userAvatarDetails = useHookstate(getMutableState(WorldState).userAvatarDetails)

  const clientSettingState = useHookstate(getMutableState(AdminClientSettingsState))
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
      authState.set(temp)
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
    (authState?.value.discord && !oauthConnectedState?.value?.discord) ||
    (authState?.value?.facebook && !oauthConnectedState?.value?.facebook) ||
    (authState?.value?.github && !oauthConnectedState?.value?.github) ||
    (authState?.value?.google && !oauthConnectedState?.value?.google) ||
    (authState?.value?.linkedin && !oauthConnectedState?.value?.linkedin) ||
    (authState?.value?.twitter && !oauthConnectedState?.value?.twitter)

  const removeSocial =
    (authState?.value?.discord && oauthConnectedState?.value?.discord) ||
    (authState?.value?.facebook && oauthConnectedState?.value?.facebook) ||
    (authState?.value?.github && oauthConnectedState?.value?.github) ||
    (authState?.value?.google && oauthConnectedState?.value?.google) ||
    (authState?.value?.linkedin && oauthConnectedState?.value?.linkedin) ||
    (authState?.value?.twitter && oauthConnectedState?.value?.twitter)

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
    selfUser && username.set(selfUser.name.value)
  }, [selfUser.name.value])

  useEffect(() => {
    oauthConnectedState.set(initialOAuthConnectedState)
    if (selfUser.identityProviders.value)
      for (let ip of selfUser.identityProviders.value) {
        switch (ip.type) {
          case 'discord':
            oauthConnectedState.set((oauthConnectedState) => {
              return { ...oauthConnectedState, discord: true }
            })
            break
          case 'facebook':
            oauthConnectedState.set((oauthConnectedState) => {
              return { ...oauthConnectedState, facebook: true }
            })
            break
          case 'linkedin':
            oauthConnectedState.set((oauthConnectedState) => {
              return { ...oauthConnectedState, linkedin: true }
            })
            break
          case 'google':
            oauthConnectedState.set((oauthConnectedState) => {
              return { ...oauthConnectedState, google: true }
            })
            break
          case 'twitter':
            oauthConnectedState.set((oauthConnectedState) => {
              return { ...oauthConnectedState, twitter: true }
            })
            break
          case 'github':
            oauthConnectedState.set((oauthConnectedState) => {
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
    username.set(e.target.value)
  }

  const handleUpdateUsername = () => {
    const name = username.value.trim()
    if (!name) return
    if (selfUser.name.value.trim() !== name) {
      // @ts-ignore
      AuthService.updateUsername(userId, name)
    }
  }
  const handleInputChange = (e) => emailPhone.set(e.target.value)

  const validate = () => {
    if (emailPhone.value === '') return false
    if (validateEmail(emailPhone.value.trim()) && authState?.value?.emailMagicLink) type = 'email'
    else if (validatePhoneNumber(emailPhone.value.trim()) && authState?.value?.smsMagicLink) type = 'sms'
    else {
      return false
    }

    return true
  }

  const handleGuestSubmit = (e: any): any => {
    e.preventDefault()
    if (!validate()) return
    if (type === 'email') AuthService.createMagicLink(emailPhone.value, authState.value, 'email')
    else if (type === 'sms') AuthService.createMagicLink(emailPhone.value, authState.value, 'sms')
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
    showUserId.set(false)
    showApiKey.set(false)
    await AuthService.logoutUser()
  }

  const refreshApiKey = () => {
    AuthService.updateApiKey()
  }

  const getConnectText = () => {
    if (authState?.value?.emailMagicLink && authState?.value?.smsMagicLink) {
      return t('user:usermenu.profile.connectPhoneEmail')
    } else if (authState?.value?.emailMagicLink && !authState?.value?.smsMagicLink) {
      return t('user:usermenu.profile.connectEmail')
    } else if (!authState?.value?.emailMagicLink && authState?.value?.smsMagicLink) {
      return t('user:usermenu.profile.connectPhone')
    } else {
      return ''
    }
  }

  const getConnectPlaceholder = () => {
    if (authState?.value?.emailMagicLink && authState?.value?.smsMagicLink) {
      return t('user:usermenu.profile.ph-phoneEmail')
    } else if (authState?.value?.emailMagicLink && !authState?.value?.smsMagicLink) {
      return t('user:usermenu.profile.ph-email')
    } else if (!authState?.value?.emailMagicLink && authState?.value?.smsMagicLink) {
      return t('user:usermenu.profile.ph-phone')
    } else {
      return ''
    }
  }

  const handleOpenSelectAvatarWidget = () => {
    WidgetAppService.setWidgetVisibility(WidgetName.SELECT_AVATAR, true)
  }

  const enableSocial =
    authState?.value?.discord ||
    authState?.value?.facebook ||
    authState?.value?.github ||
    authState?.value?.google ||
    authState?.value?.linkedin ||
    authState?.value?.twitter

  const enableConnect = authState?.value?.emailMagicLink || authState?.value?.smsMagicLink

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
                value={username.value || ''}
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
                <h2 className="showUserId" id="show-user-id" onClick={() => showUserId.set(!showUserId.value)}>
                  {showUserId.value ? t('user:usermenu.profile.hideUserId') : t('user:usermenu.profile.showUserId')}
                </h2>
                {selfUser?.apiKey?.id && (
                  <h2 className="showUserId" onClick={() => showApiKey.set(!showApiKey.value)}>
                    {showApiKey.value ? t('user:usermenu.profile.hideApiKey') : t('user:usermenu.profile.showApiKey')}
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

          {showUserId.value && (
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

          {showApiKey.value && (
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
                {authState?.value?.discord && !oauthConnectedState?.value?.discord && (
                  <IconButton
                    id="discord"
                    onClick={handleOAuthServiceClick}
                    icon={<DiscordIcon width="40" height="40" viewBox="0 0 40 40" />}
                  />
                )}
                {authState?.value?.google && !oauthConnectedState?.value?.google && (
                  <IconButton
                    id="google"
                    onClick={handleOAuthServiceClick}
                    icon={<GoogleIcon width="40" height="40" viewBox="0 0 40 40" />}
                  />
                )}
                {authState?.value?.facebook && !oauthConnectedState?.value?.facebook && (
                  <IconButton
                    id="facebook"
                    onClick={handleOAuthServiceClick}
                    icon={<FacebookIcon width="40" height="40" viewBox="0 0 40 40" />}
                  />
                )}
                {authState?.value?.linkedin && !oauthConnectedState?.value?.linkedin && (
                  <IconButton
                    id="linkedin"
                    onClick={handleOAuthServiceClick}
                    icon={<LinkedInIcon width="40" height="40" viewBox="0 0 40 40" />}
                  />
                )}
                {authState?.value?.twitter && !oauthConnectedState?.value?.twitter && (
                  <IconButton
                    id="twitter"
                    onClick={handleOAuthServiceClick}
                    icon={<TwitterIcon width="40" height="40" viewBox="0 0 40 40" />}
                  />
                )}
                {authState?.value?.github && !oauthConnectedState?.value?.github && (
                  <IconButton id="github" onClick={handleOAuthServiceClick} icon={<Icon type="GitHub" />} />
                )}
              </div>
              {!selfUser?.isGuest.value && removeSocial && (
                <h3 className="textBlock">{t('user:usermenu.profile.removeSocial')}</h3>
              )}
              {!selfUser?.isGuest.value && removeSocial && (
                <div className="socialContainer">
                  {authState?.value?.discord && oauthConnectedState?.value?.discord && (
                    <IconButton
                      id="discord"
                      onClick={handleRemoveOAuthServiceClick}
                      icon={<DiscordIcon width="40" height="40" viewBox="0 0 40 40" />}
                    />
                  )}
                  {authState?.value?.google && oauthConnectedState?.value?.google && (
                    <IconButton
                      id="google"
                      onClick={handleRemoveOAuthServiceClick}
                      icon={<GoogleIcon width="40" height="40" viewBox="0 0 40 40" />}
                    />
                  )}
                  {authState?.value?.facebook && oauthConnectedState?.value?.facebook && (
                    <IconButton
                      id="facebook"
                      onClick={handleRemoveOAuthServiceClick}
                      icon={<Icon type="Facebook" width="40" height="40" viewBox="0 0 40 40" />}
                    />
                  )}
                  {authState?.value?.linkedin && oauthConnectedState?.value?.linkedin && (
                    <IconButton
                      id="linkedin"
                      onClick={handleRemoveOAuthServiceClick}
                      icon={<LinkedInIcon width="40" height="40" viewBox="0 0 40 40" />}
                    />
                  )}
                  {authState?.value?.twitter && oauthConnectedState?.value?.twitter && (
                    <IconButton
                      id="twitter"
                      onClick={handleRemoveOAuthServiceClick}
                      icon={<Icon type="Twitter" width="40" height="40" viewBox="0 0 40 40" />}
                    />
                  )}
                  {authState?.value?.github && oauthConnectedState?.value?.github && (
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
                  deleteControlsOpen.set(!deleteControlsOpen.value)
                  confirmDeleteOpen.set(false)
                }}
              >
                {t('user:usermenu.profile.delete.deleteAccount')}
              </h2>
              {deleteControlsOpen.value && !confirmDeleteOpen.value && (
                <div className="deleteContainer">
                  <h3 className="deleteText">{t('user:usermenu.profile.delete.deleteControlsText')}</h3>
                  <div className="deleteButtonContainer">
                    <XRTextButton
                      variant="outlined"
                      content={t('user:usermenu.profile.delete.deleteControlsCancel')}
                      onClick={() => deleteControlsOpen.set(false)}
                    />
                    <XRTextButton
                      variant="gradient"
                      onClick={() => {
                        deleteControlsOpen.set(false)
                        confirmDeleteOpen.set(true)
                      }}
                    >
                      {t('user:usermenu.profile.delete.deleteControlsConfirm')}
                    </XRTextButton>
                  </div>
                </div>
              )}
              {confirmDeleteOpen.value && (
                <div className="deleteContainer">
                  <h3 className="deleteText">{t('user:usermenu.profile.delete.finalDeleteText')}</h3>
                  <div className="deleteButtonContainer">
                    <XRTextButton
                      variant="gradient"
                      onClick={() => {
                        AuthService.removeUser(userId)
                        AuthService.logoutUser()
                        confirmDeleteOpen.set(false)
                      }}
                    >
                      {t('user:usermenu.profile.delete.finalDeleteConfirm')}
                    </XRTextButton>
                    <XRTextButton variant="outlined" onClick={() => confirmDeleteOpen.set(false)}>
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
