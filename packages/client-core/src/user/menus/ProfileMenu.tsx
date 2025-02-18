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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import commonStyles from '@ir-engine/client-core/src/common/components/common.module.scss'
import { useFind } from '@ir-engine/common'
import { validateEmail, validatePhoneNumber } from '@ir-engine/common/src/config'
import multiLogger from '@ir-engine/common/src/logger'
import {
  ScopeType,
  UserName,
  authenticationSettingPath,
  clientSettingPath,
  identityProviderPath,
  scopePath,
  userApiKeyPath,
  userPath
} from '@ir-engine/common/src/schema.type.module'
import {
  defineState,
  getMutableState,
  syncStateWithLocalStorage,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'

import { API } from '@ir-engine/common'
import { USERNAME_MAX_LENGTH } from '@ir-engine/common/src/constants/UserConstants'
import { INVALID_USER_NAME_REGEX } from '@ir-engine/common/src/regex'
import { Checkbox, Input, Tooltip } from '@ir-engine/ui'
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
  Trash04Lg,
  TwitterOriginalFalse
} from '@ir-engine/ui/src/icons'
import AvatarImage from '@ir-engine/ui/src/primitives/tailwind/AvatarImage'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { FaApple } from 'react-icons/fa'
import { initialAuthState, initialOAuthConnectedState } from '../../common/initialAuthState'
import { NotificationService } from '../../common/services/NotificationService'
import { PopoverState } from '../../common/services/PopoverState'
import { useUserAvatarThumbnail } from '../../hooks/useUserAvatarThumbnail'
import { useZendesk } from '../../hooks/useZendesk'
import { clientContextParams } from '../../util/ClientContextState'
import { AuthService, AuthState } from '../services/AuthService'
import { AvatarService } from '../services/AvatarService'
import AvatarSelectMenu from './avatar/AvatarSelectMenu'
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
  const { t } = useTranslation()
  const location = useLocation()

  const selfUser = useHookstate(getMutableState(AuthState).user)

  const username = useHookstate(selfUser?.name.value)
  const emailPhone = useHookstate('')
  const error = useHookstate(false)
  const errorUsername = useHookstate('')
  const showUserId = useHookstate(false)
  const showApiKey = useHookstate(false)
  const showDeleteAccount = useHookstate(false)
  const oauthConnectedState = useHookstate(Object.assign({}, initialOAuthConnectedState))
  const authState = useHookstate(initialAuthState)
  /** Login Link feature that was needed for multi cam mocap that is not currently necessary. Keeping code around for now if we return to it*/
  //const loginLink = useHookstate('')

  const authSetting = useFind(authenticationSettingPath).data.at(0)
  const clientSetting = useFind(clientSettingPath).data.at(0)
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

  const submitAgeVerified = () => {
    if (!originallyAgeVerified.value && !checked18OrOver) {
      API.instance
        .service(userPath)
        .patch(userId, { ageVerified: true })
        .then(() => {
          selfUser.ageVerified.set(true)
          logger.info({
            event_name: 'accept_tos'
          })
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
    if (!loading.value) logger.info({ event_name: 'view_profile' })
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

  const updateUserName = (e: React.MouseEvent | React.KeyboardEvent) => {
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
        logger.info({
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
        logger.info({
          event_name: 'connect_email',
          event_value: e.currentTarget.id
        })
      )
    else if (type === 'sms')
      AuthService.createMagicLink(emailPhone.value, authState?.value, 'sms', redirectUrl).then(() =>
        logger.info({
          event_name: 'connect_sms',
          event_value: e.currentTarget.id
        })
      )
    return
  }

  const handleOAuthServiceClick = (serviceName: keyof typeof initialOAuthConnectedState) => {
    logger.info({
      event_name: 'connect_social_login',
      event_value: serviceName
    })
    AuthService.loginUserByOAuth(serviceName, location, true)
  }

  const handleRemoveOAuthServiceClick = (serviceName: keyof typeof initialOAuthConnectedState) => {
    logger.info({
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
    <div className="absolute z-50 h-fit max-h-[60vh] w-[50vw] min-w-[720px] max-w-2xl overflow-y-auto rounded-2xl bg-surface-1 p-10">
      <div className="grid w-full grid-cols-2 gap-x-2">
        <div className="grid grid-cols-3 gap-x-2">
          <div className="relative col-span-1 h-[3.75rem] w-[3.75rem]">
            <AvatarImage size="fill" src={avatarThumbnail} />
            <button
              onClick={() => {
                PopoverState.showPopupover(<AvatarSelectMenu showBackButton={true} previewEnabled={true} />)
              }}
              className="absolute -bottom-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#DDE1E5] p-2"
            >
              <Edit01Lg className="place-items-center text-text-secondary" />
            </button>
          </div>

          <div className="col-span-2 grid grid-cols-1 gap-y-1">
            <Text fontSize="xl" fontWeight="semibold" className="text-text-primary">
              {hasAdminAccess ? t('user:usermenu.profile.youAreAn') : t('user:usermenu.profile.youAreA')}
              <span className={commonStyles.bold}>{hasAdminAccess ? ' Admin' : isGuest ? ' Guest' : ' User'}</span>.
            </Text>

            {acceptedTOS && selfUser?.inviteCode.value && (
              <Text fontSize="sm" className="text-text-secondary">
                {t('user:usermenu.profile.inviteCode')}: {selfUser.inviteCode.value}
              </Text>
            )}

            {acceptedTOS && (
              <button className="w-fit" onClick={() => showUserId.set(!showUserId.value)}>
                <Text fontSize="sm" className="text-text-secondary">
                  {showUserId.value ? t('user:usermenu.profile.hideUserId') : t('user:usermenu.profile.showUserId')}
                </Text>
              </button>
            )}

            {acceptedTOS && apiKey?.id && (
              <button onClick={() => showApiKey.set(!showApiKey.value)} className="w-fit text-text-secondary">
                <Text fontSize="sm">
                  {showApiKey.value ? t('user:usermenu.profile.hideApiKey') : t('user:usermenu.profile.showApiKey')}
                </Text>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-x-2">
          <button
            className="col-span-1 flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-full bg-surface-0 p-2"
            onClick={() => {
              PopoverState.showPopupover(<SettingsMenu />)
            }}
          >
            <CogLg className="h-10 w-10 text-text-primary" />
          </button>

          {initialized && (
            <div className="col-span-2 grid grid-cols-1 gap-y-2">
              <button
                className="flex w-full items-center justify-center gap-x-2 rounded-md bg-[#616161] p-1 text-text-primary-button"
                onClick={openChat}
              >
                <HelpIconLg />
                {t('user:usermenu.profile.helpChat')}
              </button>

              <button
                className="flex w-full items-center justify-center gap-x-2 rounded-md bg-[#C3324B] p-1 text-text-primary-button"
                onClick={openChat}
              >
                <ReportWebsiteDefaullg />
                {t('user:usermenu.profile.reportWorld')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 grid w-full grid-cols-1 gap-y-4">
        {isGuest && !originallyAcceptedTOS && (
          <>
            <Checkbox
              checked={checkedTOS.value}
              onChange={() => checkedTOS.set((v) => !v)}
              label={t('user:usermenu.profile.agreeTOS')}
            />
            <Checkbox
              checked={checked13OrOver.value}
              onChange={() => checked13OrOver.set((v) => !v)}
              label={t('user:usermenu.profile.confirmAge13')}
            />
          </>
        )}

        {!isGuest && !originallyAgeVerified.value && (
          <Checkbox
            checked={checked18OrOver}
            onChange={submitAgeVerified}
            label={t('user:usermenu.profile.confirmAge18')}
          />
        )}

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
            <button className="h-4 w-4" onMouseDown={updateUserName}>
              <CheckLg />
            </button>
          }
          fullWidth
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
                className="h-4 w-4"
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
              <button className="h-4 w-4" onMouseDown={refreshApiKey}>
                <Refresh1Lg />
              </button>
            }
            endComponent={
              <button
                className="h-4 w-4"
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
                <button className="h-4 w-4" onMouseDown={handleGuestSubmit}>
                  <Send01Lg />
                </button>
              }
              fullWidth
              value={emailPhone.value}
              onChange={(e) => {
                emailPhone.set(e.target.value)
              }}
            />
          </>
        )}
      </div>

      {!isGuest && (
        <div className="mt-5 grid w-1/2 grid-cols-1 gap-y-2 px-5">
          <button
            className="flex w-full items-center justify-start gap-x-2 p-2 text-text-primary"
            onClick={handleLogout}
          >
            <LogIn01Lg />
            {t('user:usermenu.profile.logout')}
          </button>

          <button
            className="flex w-full items-center justify-start gap-x-2 p-2 text-text-primary"
            onClick={() => {
              PopoverState.showPopupover(
                <ConfirmDialog
                  title={t('user:usermenu.profile.delete.finalDeleteConfirm')}
                  text={t('user:usermenu.profile.delete.finalDeleteText')}
                  onSubmit={async () => {
                    AuthService.removeUser(userId)
                    AuthService.logoutUser()
                    showDeleteAccount.set(false)
                  }}
                />
              )
            }}
          >
            <Trash04Lg />
            {t('user:usermenu.profile.delete.deleteAccount')}
          </button>
        </div>
      )}

      <hr className="mb-5 mt-5 border-[#616161]" />

      {!hideLogin && acceptedTOS && enableSocial && (
        <div className="flex w-full items-center justify-center gap-x-2">
          {authState?.value?.facebook && (
            <Tooltip
              position="top"
              content={`Click to ${oauthConnectedState.facebook.value ? 'unlink' : 'link'} your Facebook account`}
            >
              <button
                className="relative h-10 w-10"
                onClick={() => {
                  if (oauthConnectedState.facebook.value) {
                    handleRemoveOAuthServiceClick('facebook')
                  } else {
                    handleOAuthServiceClick('facebook')
                  }
                }}
              >
                <FacebookOriginalFalse className="h-10 w-10" />
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
                className="relative h-10 w-10"
                onClick={() => {
                  if (oauthConnectedState.twitter.value) {
                    handleRemoveOAuthServiceClick('twitter')
                  } else {
                    handleOAuthServiceClick('twitter')
                  }
                }}
              >
                <TwitterOriginalFalse className="h-10 w-10" />
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
                className="relative h-10 w-10"
                onClick={() => {
                  if (oauthConnectedState.google.value) {
                    handleRemoveOAuthServiceClick('google')
                  } else {
                    handleOAuthServiceClick('google')
                  }
                }}
              >
                <GoogleOriginalFalse className="h-10 w-10" />
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
                className="relative h-10 w-10"
                onClick={() => {
                  if (oauthConnectedState.apple.value) {
                    handleRemoveOAuthServiceClick('apple')
                  } else {
                    handleOAuthServiceClick('apple')
                  }
                }}
              >
                <FaApple className="h-10 w-10" />
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
                className="relative h-10 w-10"
                onClick={() => {
                  if (oauthConnectedState.github.value) {
                    handleRemoveOAuthServiceClick('github')
                  } else {
                    handleOAuthServiceClick('github')
                  }
                }}
              >
                <GithubOriginalFalse className="h-10 w-10" />
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
                className="relative h-10 w-10"
                onClick={() => {
                  if (oauthConnectedState.discord.value) {
                    handleRemoveOAuthServiceClick('discord')
                  } else {
                    handleOAuthServiceClick('discord')
                  }
                }}
              >
                <DiscordOriginalFalse className="h-10 w-10" />
                {oauthConnectedState.discord.value && (
                  <CheckLg className="absolute -right-1 -top-1 font-semibold text-green-400" />
                )}
              </button>
            </Tooltip>
          )}
        </div>
      )}

      <a href={clientSetting?.privacyPolicy} target="_blank">
        <Text className="mt-5 w-full text-center text-text-tertiary" fontSize="sm">
          {t('user:usermenu.profile.privacyPolicy')}
        </Text>
      </a>
    </div>
  )
}

export default ProfileMenu
