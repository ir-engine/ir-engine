/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { useFind } from '@ir-engine/common'
import { validateEmail, validatePhoneNumber } from '@ir-engine/common/src/config'
import multiLogger from '@ir-engine/common/src/logger'
import {
  ScopeType,
  UserName,
  engineSettingPath,
  identityProviderPath,
  projectSettingPath,
  scopePath,
  userApiKeyPath,
  userPath
} from '@ir-engine/common/src/schema.type.module'
import {
  defineState,
  getMutableState,
  getState,
  syncStateWithLocalStorage,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'

import { API } from '@ir-engine/common'
import { USERNAME_MAX_LENGTH } from '@ir-engine/common/src/constants/UserConstants'
import useEngineSetting from '@ir-engine/common/src/hooks/useEngineSetting'
import { INVALID_USER_NAME_REGEX } from '@ir-engine/common/src/regex'
import { unflattenArrayToObject } from '@ir-engine/common/src/utils/jsonHelperUtils'
import { ClientEngineSettingType } from '@ir-engine/server-core/src/appconfig'
import { iOS, isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import { Button, Checkbox, Input, Tooltip } from '@ir-engine/ui'
import ConfirmDialog from '@ir-engine/ui/src/components/tailwind/ConfirmDialog'
import {
  CheckLg,
  CogLg,
  Copy03Lg,
  DiscordOriginalFalse,
  Edit01Lg,
  FacebookOriginalFalse,
  GithubOriginalFalse,
  GoogleOriginalFalse,
  HelpIconLg,
  LogIn01Lg,
  Refresh1Lg,
  ReportWebsiteDefaullg,
  Send01Lg,
  TwitterOriginalFalse,
  XCloseMd
} from '@ir-engine/ui/src/icons'
import AvatarImage from '@ir-engine/ui/src/primitives/tailwind/AvatarImage'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { FaApple } from 'react-icons/fa'
import { twMerge } from 'tailwind-merge'
import { initialAuthState, initialOAuthConnectedState } from '../../common/initialAuthState'
import { ModalState } from '../../common/services/ModalState'
import { NotificationService } from '../../common/services/NotificationService'
import { ProjectState } from '../../common/services/ProjectService'
import { useUserAvatarThumbnail } from '../../hooks/useUserAvatarThumbnail'
import { useZendesk } from '../../hooks/useZendesk'
import { LocationState } from '../../social/services/LocationService'
import { clientContextParams } from '../../util/ClientContextState'
import { AuthService, AuthState } from '../services/AuthService'
import { AvatarService } from '../services/AvatarService'
import AvatarSelectMenu from './avatar/AvatarSelectMenu'
import ReportMenu from './ReportMenu'
import SettingsMenu from './SettingsMenu'

const logger = multiLogger.child({ component: 'engine:ecs:ProfileMenu', modifier: clientContextParams })
interface Props {
  hideLogin?: boolean
  onClose?: () => void
}

export const TermsOfServiceState = defineState({
  name: 'ir.client.TermsOfServiceState',
  initial: {
    accepted: false
  },
  extension: syncStateWithLocalStorage(['accepted'])
})

const ProfileMenu = ({ hideLogin, onClose }: Props): JSX.Element => {
  const engineSettingData = useFind(engineSettingPath, {
    query: {
      category: 'authentication',
      paginate: false
    }
  })

  const authSetting = useMemo(() => {
    if (!engineSettingData.data) return null

    return unflattenArrayToObject(
      engineSettingData.data.map((el) => ({
        key: el.key,
        value: el.value,
        dataType: el.dataType
      }))
    )
  }, [engineSettingData.status])

  const clientSetting = useEngineSetting<ClientEngineSettingType>('client')

  const { t } = useTranslation()
  const location = useLocation()

  const selfUser = useHookstate(getMutableState(AuthState).user)

  const username = useHookstate(selfUser?.name.value)
  const emailPhone = useHookstate('')
  const error = useHookstate(false)
  const errorUsername = useHookstate('')
  const showUserId = useHookstate(false)
  const showApiKey = useHookstate(false)
  const oauthConnectedState = useHookstate(Object.assign({}, initialOAuthConnectedState))
  const authState = useHookstate(initialAuthState)
  /** Login Link feature that was needed for multi cam mocap that is not currently necessary. Keeping code around for now if we return to it*/
  //const loginLink = useHookstate('')

  const loading = useHookstate(getMutableState(AuthState).isProcessing)
  const userId = selfUser.id.value
  const apiKey = useFind(userApiKeyPath).data[0]
  const isGuest = selfUser.isGuest.value
  const acceptedTOS = useMutableState(TermsOfServiceState).accepted.value

  const checkedTOS = useHookstate(!isGuest || acceptedTOS)
  const checked13OrOver = useHookstate(!isGuest || acceptedTOS)
  const checked18OrOver = selfUser.ageVerified.value

  const originallyAgeVerified = useHookstate(checked18OrOver)
  const originallyAcceptedTOS = useHookstate(acceptedTOS).value
  const currentLocation = getState(LocationState).currentLocation.location

  const projectState = useMutableState(ProjectState)

  const projectSettings = useFind(projectSettingPath, {
    query: {
      projectId: currentLocation.projectId
    }
  })
  const creatorPrivacyPolicyUrl = projectSettings.data.find((setting) => setting.key === 'PrivacyPolicyUrl')

  const avatarSelectMenuRef = useRef<{
    handleClose: () => Promise<void>
  } | null>(null)

  const submitAgeVerified = () => {
    if (!originallyAgeVerified.value && !checked18OrOver) {
      API.instance
        .service(userPath)
        .patch(userId, { ageVerified: true })
        .then(() => {
          selfUser.ageVerified.set(true)
          logger.analytics({ event_name: 'accept_tos' })
        })
        .catch((e) => {
          console.error(e, 'Error updating user')
        })
    }
  }

  useEffect(() => {
    if (checked13OrOver.value && checkedTOS.value) {
      getMutableState(TermsOfServiceState).accepted.set(true)
    }
  }, [checked13OrOver, checkedTOS])

  const adminScopeQuery = useFind(scopePath, {
    query: {
      userId: selfUser.id.value,
      type: 'admin:admin' as ScopeType
    }
  })

  const hasAdminAccess = adminScopeQuery.data.length > 0
  const avatarThumbnail = useUserAvatarThumbnail(userId)

  const { initialized, openChat } = useZendesk()

  useEffect(() => {
    if (authSetting) {
      const temp = { ...initialAuthState }
      authSetting?.authStrategies?.forEach((el) => {
        Object.entries(el).forEach(([strategyName, strategy]) => {
          temp[strategyName] = strategy
        })
      })
      authState.set(temp)
    }
  }, [authSetting])

  let type = ''

  useEffect(() => {
    selfUser && username.set(selfUser.name.value)
  }, [selfUser.name.value])

  useEffect(() => {
    if (!loading.value) logger.analytics({ event_name: 'view_profile' })
  }, [loading.value])

  const identityProvidersQuery = useFind(identityProviderPath)

  useEffect(() => {
    oauthConnectedState.set(Object.assign({}, initialOAuthConnectedState))
    for (const ip of identityProvidersQuery.data) {
      switch (ip.type) {
        case 'apple':
          oauthConnectedState.merge({ apple: true })
          break
        case 'discord':
          oauthConnectedState.merge({ discord: true })
          break
        case 'facebook':
          oauthConnectedState.merge({ facebook: true })
          break
        case 'linkedin':
          oauthConnectedState.merge({ linkedin: true })
          break
        case 'google':
          oauthConnectedState.merge({ google: true })
          break
        case 'twitter':
          oauthConnectedState.merge({ twitter: true })
          break
        case 'github':
          oauthConnectedState.merge({ github: true })
          break
      }
    }
  }, [identityProvidersQuery.data])

  const updateUserName = (e: React.MouseEvent | React.KeyboardEvent | MouseEvent | TouchEvent) => {
    e.preventDefault()
    handleUpdateUsername()
  }

  const handleUsernameChange = (e) => {
    const validInput = e.target.value.replace(INVALID_USER_NAME_REGEX, '')
    username.set(validInput)
    if (!e.target.value) errorUsername.set(t('user:usermenu.profile.usernameError'))
    else if (e.target.value.length > USERNAME_MAX_LENGTH)
      errorUsername.set(
        t('user:usermenu.profile.usernameLengthError', {
          maxCharacters: USERNAME_MAX_LENGTH
        })
      )
    else errorUsername.set('')
  }

  const handleUpdateUsername = () => {
    const name = username.value.trim() as UserName
    if (!name) return
    if (errorUsername.value.length > 0) return
    if (selfUser.name.value.trim() !== name) {
      AvatarService.updateUsername(userId, name).then(() =>
        logger.analytics({
          event_name: 'rename_user'
        })
      )
    }
  }

  const validate = () => {
    if (emailPhone.value === '') return false
    if (validateEmail(emailPhone.value.trim()) && authState?.value?.emailMagicLink) type = 'email'
    else if (validatePhoneNumber(emailPhone.value.trim()) && authState?.value?.smsMagicLink) type = 'sms'
    else {
      error.set(true)
      return false
    }

    error.set(false)
    return true
  }

  const handleGuestSubmit = (e: any): any => {
    e.preventDefault()
    if (!validate()) return

    // Get the url without query parameters.
    const redirectUrl = window.location.toString().replace(window.location.search, '')
    if (type === 'email')
      AuthService.createMagicLink(emailPhone.value, authState?.value, 'email', redirectUrl).then(() =>
        logger.analytics({
          event_name: 'connect_email',
          event_value: e.currentTarget.id
        })
      )
    else if (type === 'sms')
      AuthService.createMagicLink(emailPhone.value, authState?.value, 'sms', redirectUrl).then(() =>
        logger.analytics({
          event_name: 'connect_sms',
          event_value: e.currentTarget.id
        })
      )
    return
  }

  const handleOAuthServiceClick = (serviceName: keyof typeof initialOAuthConnectedState) => {
    logger.analytics({
      event_name: 'connect_social_login',
      event_value: serviceName
    })
    AuthService.loginUserByOAuth(serviceName, location, true)
  }

  const handleRemoveOAuthServiceClick = (serviceName: keyof typeof initialOAuthConnectedState) => {
    logger.analytics({
      event_name: 'disconnect_social_login',
      event_value: serviceName
    })
    AuthService.removeUserOAuth(serviceName)
  }

  const handleLogout = async () => {
    if (onClose) onClose()
    showUserId.set(false)
    showApiKey.set(false)
    await AuthService.logoutUser()
    oauthConnectedState.set(Object.assign({}, initialOAuthConnectedState))
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

  const getErrorText = () => {
    if (authState?.value?.emailMagicLink && authState?.value?.smsMagicLink) {
      return t('user:usermenu.profile.phoneEmailError')
    } else if (authState?.value?.emailMagicLink && !authState?.value?.smsMagicLink) {
      return t('user:usermenu.profile.emailError')
    } else if (!authState?.value?.emailMagicLink && authState?.value?.smsMagicLink) {
      return t('user:usermenu.profile.phoneError')
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

  const onAvatarSelectClose = () => {
    if (avatarSelectMenuRef.current) {
      avatarSelectMenuRef.current?.handleClose()
    } else {
      ModalState.closeModal()
    }
  }

  const enableSocial =
    authState?.value?.apple ||
    authState?.value?.discord ||
    authState?.value?.facebook ||
    authState?.value?.github ||
    authState?.value?.google ||
    authState?.value?.linkedin ||
    authState?.value?.twitter

  const enableConnect = authState?.value?.emailMagicLink || authState?.value?.smsMagicLink

  return (
    <div className="absolute z-50 h-fit max-h-[90dvh] w-[50vw] min-w-[720px] max-w-2xl overflow-y-auto rounded-2xl bg-surface-4 p-6 smh:max-h-[60dvh] smh:px-8 smh:py-6">
      <div className="items-end">
        <button
          className={twMerge(
            'flex h-[2rem] w-[2rem] items-center justify-center justify-self-end rounded-full text-ui-secondary hover:text-ui-hover-secondary focus:bg-ui-select-primary'
          )}
          onClick={() => {
            ModalState.closeModal()
          }}
        >
          <XCloseMd className="h-[1.5rem] w-[1.5rem]" />
        </button>
      </div>
      <div className="relative grid w-full grid-cols-5 gap-x-2">
        <div className="col-span-3 grid grid-cols-[auto,1fr] gap-x-6">
          <div className="relative h-20 w-20">
            <AvatarImage size="large" src={avatarThumbnail} className="object-cover" />
            {
              /**@todo disable avatar editing on iOS. Temporary solution for memory related crashing on iOS. */
              !iOS && (
                <button
                  onClick={() => {
                    ModalState.openModal(
                      <AvatarSelectMenu ref={avatarSelectMenuRef} showBackButton={true} previewEnabled={true} />,
                      onAvatarSelectClose
                    )
                  }}
                  className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#DDE1E5] p-2"
                  data-testid="profile-menu-avatar-edit-button"
                >
                  <Edit01Lg className="place-items-center text-text-secondary" />
                </button>
              )
            }
          </div>

          <div className="flex flex-col">
            <Text fontSize="xl" fontWeight="semibold" className="text-text-primary" data-testid="profile-menu-username">
              {hasAdminAccess ? t('user:usermenu.profile.youAreAn') : t('user:usermenu.profile.youAreA')}
              <span>{hasAdminAccess ? ' Admin' : isGuest ? ' Guest' : ' User'}</span>
            </Text>

            {acceptedTOS && (
              <button
                className="w-fit"
                data-testid={`profile-menu-${showUserId.value ? 'hide' : 'show'}-user-id-button`}
                onClick={() => showUserId.set(!showUserId.value)}
              >
                <Text fontSize="sm" className="text-text-primary">
                  {showUserId.value ? t('user:usermenu.profile.hideUserId') : t('user:usermenu.profile.showUserId')}
                </Text>
              </button>
            )}

            {acceptedTOS && apiKey?.id && (
              <button
                data-testid={`profile-menu-${showApiKey.value ? 'hide' : 'show'}-api-key-button`}
                onClick={() => showApiKey.set(!showApiKey.value)}
                className="w-fit text-text-primary"
              >
                <Text fontSize="sm">
                  {showApiKey.value ? t('user:usermenu.profile.hideApiKey') : t('user:usermenu.profile.showApiKey')}
                </Text>
              </button>
            )}
          </div>
        </div>

        <div className="col-span-2 grid grid-cols-[auto_136px] gap-x-6 lg:grid-cols-[auto_auto]">
          <button
            className={twMerge(
              'flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-full bg-ui-secondary p-2 text-text-primary-button hover:bg-ui-hover-secondary focus:bg-ui-select-secondary',
              initialized ? 'justify-self-end' : 'col-start-3'
            )}
            data-testid="profile-menu-settings-button"
            onClick={() => {
              ModalState.openModal(<SettingsMenu />)
            }}
          >
            <CogLg className="h-[1.875rem] w-[1.875rem]" />
          </button>
          {initialized && (
            <div className="flex w-full flex-col items-end gap-y-4">
              <Button
                variant="secondary"
                className="w-[136px] rounded-[10px] lg:w-full"
                data-testid="profile-menu-help-chat-button"
                onClick={openChat}
              >
                <HelpIconLg />
                {t('user:usermenu.profile.helpChat')}
              </Button>

              <Button
                variant="red"
                fullWidth={!isMobile}
                className="w-[136px] rounded-[10px] lg:w-full"
                data-testid="profile-menu-report-space-button"
                onClick={() => ModalState.openModal(<ReportMenu type="location" locationId={currentLocation.id} />)}
              >
                <ReportWebsiteDefaullg />
                {t('user:usermenu.profile.reportWorld')}
              </Button>
            </div>
          )}
        </div>

        <div
          className={twMerge(
            'absolute left-[6.5rem] flex flex-col gap-y-2 !italic',
            acceptedTOS ? 'top-16' : 'top-11',
            initialized && 'top-[4.5rem]'
          )}
        >
          {apiKey?.id && <div className="h-2"></div>}
          {isGuest && !originallyAcceptedTOS && (
            <>
              <div className="flex w-full items-center justify-start gap-x-1">
                <Checkbox
                  variantSize="lg"
                  checked={checkedTOS.value}
                  onChange={() => checkedTOS.set((v) => !v)}
                  disabled={checkedTOS.value}
                  label={t('user:usermenu.profile.agreeTOS')}
                />
                <a
                  className="inline text-sm text-text-primary underline-offset-4 hover:text-ui-hover-primary hover:underline"
                  href={clientSetting?.data?.termsOfService}
                  target="_blank"
                >
                  {t('user:usermenu.profile.termsOfService')}
                </a>
              </div>
              <Checkbox
                variantSize="lg"
                checked={checked13OrOver.value}
                onChange={() => checked13OrOver.set((v) => !v)}
                disabled={checked13OrOver.value}
                label={t('user:usermenu.profile.confirmAge16')}
              />
            </>
          )}
          {!isGuest && !originallyAgeVerified.value && (
            <Checkbox
              variantSize="lg"
              checked={checked18OrOver}
              onChange={submitAgeVerified}
              label={t('user:usermenu.profile.confirmAge18')}
            />
          )}
        </div>
      </div>
      <div
        className={twMerge(
          'mt-1 grid w-full grid-cols-1 gap-y-1',
          isGuest && !originallyAcceptedTOS ? 'mt-7 smh:mt-16' : 'mt-2.5 smh:mt-5'
        )}
      >
        <Input
          value={username.value || ('' as UserName)}
          state={errorUsername.value ? 'error' : undefined}
          helperText={errorUsername.value}
          onChange={handleUsernameChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') updateUserName(e)
          }}
          labelProps={{
            text: t('user:usermenu.profile.lbl-username'),
            position: 'top'
          }}
          endComponent={
            <button className="h-4 w-4 text-text-primary" onMouseDown={updateUserName}>
              <CheckLg />
            </button>
          }
          fullWidth
          data-testid="profile-menu-username-input"
        />

        {showUserId.value && (
          <Input
            labelProps={{
              text: t('user:usermenu.profile.userIcon.userId'),
              position: 'top'
            }}
            value={userId}
            endComponent={
              <button
                className="h-4 w-4 text-text-primary"
                data-testid="profile-menu-user-id-copy-button"
                onMouseDown={() => {
                  navigator.clipboard.writeText(userId)
                  NotificationService.dispatchNotify(t('user:usermenu.profile.userIdCopied'), {
                    variant: 'success'
                  })
                }}
              >
                <Copy03Lg />
              </button>
            }
            fullWidth
            data-testid="profile-menu-user-id-input"
          />
        )}

        {showApiKey.value && (
          <Input
            labelProps={{
              text: t('user:usermenu.profile.apiKey'),
              position: 'top'
            }}
            value={apiKey?.token}
            startComponent={
              <button className="h-4 w-4 text-text-primary" onMouseDown={refreshApiKey}>
                <Refresh1Lg />
              </button>
            }
            endComponent={
              <button
                className="h-4 w-4 text-text-primary"
                data-testid="profile-menu-api-key-copy-button"
                onMouseDown={() => {
                  navigator.clipboard.writeText(apiKey?.token)
                  NotificationService.dispatchNotify(t('user:usermenu.profile.apiKeyCopied'), {
                    variant: 'success'
                  })
                }}
              >
                <Copy03Lg />
              </button>
            }
            fullWidth
            data-testid="profile-menu-api-key-input"
          />
        )}

        {!hideLogin && acceptedTOS && isGuest && enableConnect && (
          <>
            <Input
              labelProps={{
                text: getConnectText(),
                position: 'top'
              }}
              placeholder={getConnectPlaceholder()}
              state={error.value ? 'error' : undefined}
              helperText={error.value ? getErrorText() : ''}
              endComponent={
                <button
                  className="h-4 w-4 text-text-primary"
                  data-testid="profile-menu-submit-email-phone-number-button"
                  onMouseDown={handleGuestSubmit}
                >
                  <Send01Lg />
                </button>
              }
              fullWidth
              data-testid="profile-menu-email-phone-number-input"
              value={emailPhone.value}
              onChange={(e) => {
                emailPhone.set(e.target.value)
              }}
            />
          </>
        )}
      </div>

      {!isGuest && (
        <div className="grid w-1/2 grid-cols-1 gap-y-1 px-5 smh:mt-5 smh:gap-y-2">
          <button
            className="flex w-full items-center justify-start gap-x-2 p-2 text-text-primary"
            data-testid="profile-menu-logout-button"
            onClick={() => {
              ModalState.closeModal() // Close the ProfileMenu popover
              ModalState.openModal(
                <ConfirmDialog
                  text={t('user:usermenu.profile.logout.title')}
                  onSubmit={async () => {
                    handleLogout()
                  }}
                  onClose={() => {
                    ModalState.openModal(<ProfileMenu />)
                  }}
                />,
                () => {
                  ModalState.closeModal()
                  ModalState.openModal(<ProfileMenu />)
                }
              )
            }}
          >
            <LogIn01Lg />
            {t('user:usermenu.profile.logout.submit')}
          </button>
        </div>
      )}

      <hr className="mb-1 mt-4 border-ui-outline" />

      {!hideLogin && acceptedTOS && enableSocial && (
        <div className="flex w-full items-center justify-between gap-x-4">
          <div className="flex items-center gap-x-4" data-testid="profile-menu-social-login-buttons">
            {authState?.value?.facebook && (
              <Tooltip
                position="top"
                content={`Click to ${oauthConnectedState.facebook.value ? 'unlink' : 'link'} your Facebook account`}
              >
                <button
                  className="relative h-8 w-8"
                  data-testid="profile-menu-facebook-sso-login-button"
                  onClick={() => {
                    if (oauthConnectedState.facebook.value) {
                      handleRemoveOAuthServiceClick('facebook')
                    } else {
                      handleOAuthServiceClick('facebook')
                    }
                  }}
                >
                  <FacebookOriginalFalse className="h-8 w-8" />
                  {oauthConnectedState.facebook.value && (
                    <CheckLg className="absolute -right-1 -top-1 font-semibold text-green-400" />
                  )}
                </button>
              </Tooltip>
            )}
            {authState?.value?.twitter && (
              <Tooltip
                position="top"
                content={`Click to ${oauthConnectedState.twitter.value ? 'unlink' : 'link'} your Twitter account`}
              >
                <button
                  className="relative h-8 w-8"
                  data-testid="profile-menu-twitter-sso-login-button"
                  onClick={() => {
                    if (oauthConnectedState.twitter.value) {
                      handleRemoveOAuthServiceClick('twitter')
                    } else {
                      handleOAuthServiceClick('twitter')
                    }
                  }}
                >
                  <TwitterOriginalFalse className="h-8 w-8" />
                  {oauthConnectedState.twitter.value && (
                    <CheckLg className="absolute -right-1 -top-1 font-semibold text-green-400" />
                  )}
                </button>
              </Tooltip>
            )}
            {authState?.value?.google && (
              <Tooltip
                position="top"
                content={`Click to ${oauthConnectedState.google.value ? 'unlink' : 'link'} your Google account`}
              >
                <button
                  className="relative h-8 w-8"
                  data-testid="profile-menu-google-sso-login-button"
                  onClick={() => {
                    if (oauthConnectedState.google.value) {
                      handleRemoveOAuthServiceClick('google')
                    } else {
                      handleOAuthServiceClick('google')
                    }
                  }}
                >
                  <GoogleOriginalFalse className="h-8 w-8" />
                  {oauthConnectedState.google.value && (
                    <CheckLg className="absolute -right-1 -top-1 font-semibold text-green-400" />
                  )}
                </button>
              </Tooltip>
            )}
            {authState?.value?.apple && (
              <Tooltip
                position="top"
                content={`Click to ${oauthConnectedState.apple.value ? 'unlink' : 'link'} your Apple account`}
              >
                <button
                  className="relative h-8 w-8"
                  data-testid="profile-menu-apple-sso-login-button"
                  onClick={() => {
                    if (oauthConnectedState.apple.value) {
                      handleRemoveOAuthServiceClick('apple')
                    } else {
                      handleOAuthServiceClick('apple')
                    }
                  }}
                >
                  <FaApple className="h-8 w-8 text-text-primary" />
                  {oauthConnectedState.apple.value && (
                    <CheckLg className="absolute -right-1 -top-1 font-semibold text-green-400" />
                  )}
                </button>
              </Tooltip>
            )}
            {authState?.value?.github && (
              <Tooltip
                position="top"
                content={`Click to ${oauthConnectedState.github.value ? 'unlink' : 'link'} your Github account`}
              >
                <button
                  className="relative h-8 w-8"
                  data-testid="profile-menu-github-sso-login-button"
                  onClick={() => {
                    if (oauthConnectedState.github.value) {
                      handleRemoveOAuthServiceClick('github')
                    } else {
                      handleOAuthServiceClick('github')
                    }
                  }}
                >
                  <GithubOriginalFalse className="h-8 w-8" />
                  {oauthConnectedState.github.value && (
                    <CheckLg className="absolute -right-1 -top-1 font-semibold text-green-400" />
                  )}
                </button>
              </Tooltip>
            )}
            {authState?.value?.discord && (
              <Tooltip
                position="top"
                content={`Click to ${oauthConnectedState.discord.value ? 'unlink' : 'link'} your Discord account`}
              >
                <button
                  className="relative h-8 w-8"
                  data-testid="profile-menu-discord-sso-login-button"
                  onClick={() => {
                    if (oauthConnectedState.discord.value) {
                      handleRemoveOAuthServiceClick('discord')
                    } else {
                      handleOAuthServiceClick('discord')
                    }
                  }}
                >
                  <DiscordOriginalFalse className="h-8 w-8" />
                  {oauthConnectedState.discord.value && (
                    <CheckLg className="absolute -right-1 -top-1 font-semibold text-green-400" />
                  )}
                </button>
              </Tooltip>
            )}
          </div>
          <span className="text-sm text-text-primary">{t('user:usermenu.profile.addSocial')}</span>
        </div>
      )}

      <div className="mt-1 flex w-full items-center justify-evenly gap-x-2 smh:mt-5">
        <div className="flex-1"></div>
        <div className="flex-1">
          <a href={clientSetting?.data?.privacyPolicy} data-testid="profile-menu-privacy-policy-link" target="_blank">
            <Text className="text-center text-text-primary" fontSize="sm">
              {t('user:usermenu.profile.privacyPolicy')}
            </Text>
          </a>
          {creatorPrivacyPolicyUrl?.value && (
            <>
              <Text className="text-center text-text-primary" fontSize="sm">
                |
              </Text>
              <a href={creatorPrivacyPolicyUrl.value} target="_blank">
                <Text className="text-center text-text-primary" fontSize="sm">
                  {t('user:usermenu.profile.creatorPrivacyPolicy')}
                </Text>
              </a>
            </>
          )}
        </div>
        <div className="flex-1 text-right">
          <Text className="text-sm">
            {t('admin:components.setting.releaseVersion')}: {projectState.builderInfo.engineVersion.value}
          </Text>
        </div>
      </div>
    </div>
  )
}

export default ProfileMenu
