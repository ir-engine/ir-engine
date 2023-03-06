import { useHookstate } from '@hookstate/core'
// import * as polyfill from 'credential-handler-polyfill'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import Avatar from '@etherealengine/client-core/src/common/components/Avatar'
import Button from '@etherealengine/client-core/src/common/components/Button'
import commonStyles from '@etherealengine/client-core/src/common/components/common.module.scss'
import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import { DiscordIcon } from '@etherealengine/client-core/src/common/components/Icons/DiscordIcon'
import { FacebookIcon } from '@etherealengine/client-core/src/common/components/Icons/FacebookIcon'
import { GoogleIcon } from '@etherealengine/client-core/src/common/components/Icons/GoogleIcon'
import { LinkedInIcon } from '@etherealengine/client-core/src/common/components/Icons/LinkedInIcon'
import { TwitterIcon } from '@etherealengine/client-core/src/common/components/Icons/TwitterIcon'
import InputText from '@etherealengine/client-core/src/common/components/InputText'
import Menu from '@etherealengine/client-core/src/common/components/Menu'
import Text from '@etherealengine/client-core/src/common/components/Text'
import { validateEmail, validatePhoneNumber } from '@etherealengine/common/src/config'
// import { requestVcForEvent, vpRequestQuery } from '@etherealengine/common/src/credentials/credentials'
import multiLogger from '@etherealengine/common/src/logger'
import { WorldState } from '@etherealengine/engine/src/networking/interfaces/WorldState'
import { getState } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/Box'
import CircularProgress from '@etherealengine/ui/src/CircularProgress'
import Icon from '@etherealengine/ui/src/Icon'
import IconButton from '@etherealengine/ui/src/IconButton'

import { useAuthSettingState } from '../../../../admin/services/Setting/AuthSettingService'
import { initialAuthState, initialOAuthConnectedState } from '../../../../common/initialAuthState'
import { NotificationService } from '../../../../common/services/NotificationService'
import { AuthService, useAuthState } from '../../../services/AuthService'
import styles from '../index.module.scss'
import { getAvatarURLForUser, Views } from '../util'

const logger = multiLogger.child({ component: 'client-core:ProfileMenu' })

interface Props {
  className?: string
  hideLogin?: boolean
  allowAvatarChange?: boolean
  isPopover?: boolean
  changeActiveMenu?: (type: string | null) => void
  onClose?: () => void
}

const ProfileMenu = ({ hideLogin, allowAvatarChange, isPopover, changeActiveMenu, onClose }: Props): JSX.Element => {
  const { t } = useTranslation()
  const location = useLocation()

  const selfUser = useAuthState().user
  console.log('USER:', selfUser)

  const [username, setUsername] = useState(selfUser?.name.value)
  const [emailPhone, setEmailPhone] = useState('')
  const [error, setError] = useState(false)
  const [errorUsername, setErrorUsername] = useState('')
  const [showUserId, setShowUserId] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [oauthConnectedState, setOauthConnectedState] = useState(initialOAuthConnectedState)
  const [authState, setAuthState] = useState(initialAuthState)

  const authSettingState = useAuthSettingState()
  const [authSetting] = authSettingState?.authSettings?.value || []
  const loading = useAuthState().isProcessing.value
  const userId = selfUser.id.value
  const apiKey = selfUser.apiKey?.token?.value
  const isGuest = selfUser.isGuest.value

  const hasAdminAccess =
    selfUser?.id?.value?.length > 0 && selfUser?.scopes?.value?.find((scope) => scope.type === 'admin:admin')
  const userAvatarDetails = useHookstate(getState(WorldState).userAvatarDetails)

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

  // const loadCredentialHandler = async () => {
  //   try {
  //     const mediator = config.client.mediatorServer + `/mediator?origin=${encodeURIComponent(window.location.origin)}`

  //     await polyfill.loadOnce(mediator)
  //     console.log('Ready to work with credentials!')
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
    if (!e.target.value) setErrorUsername(t('user:usermenu.profile.usernameError'))
    else setErrorUsername('')
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

  const handleLogout = async () => {
    if (changeActiveMenu) changeActiveMenu(Views.Closed)
    else if (onClose) onClose()
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
   * by the client (browser) whenever appropriate (whenever a user performs
   * some in-engine action, makes a payment, etc).
   */
  async function handleIssueCredentialClick() {
    /** @todo temporarily disabled for vite upgrade #6453 */
    // const signedVp = await requestVcForEvent('EnteredVolumeEvent')
    // console.log('Issued VC:', JSON.stringify(signedVp, null, 2))
    // const webCredentialType = 'VerifiablePresentation'
    // // @ts-ignore
    // const webCredentialWrapper = new window.WebCredential(webCredentialType, signedVp, {
    //   recommendedHandlerOrigins: ['https://uniwallet.cloud']
    // })
    // // Use Credential Handler API to store
    // const result = await navigator.credentials.store(webCredentialWrapper)
    // console.log('Result of receiving via store() request:', result)
  }

  /**
   * Example function, requests a Verifiable Credential from the user's wallet.
   */
  async function handleRequestCredentialClick() {
    // const result = await navigator.credentials.get(vpRequestQuery)
    // console.log('VC Request query result:', result)
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
              type: 'DIDAuth' // request the controller's DID
            },
            {
              type: 'QueryByExample',
              credentialQuery: [
                {
                  example: {
                    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/xr/v1'],
                    // contains username and avatar icon
                    type: 'LoginDisplayCredential'
                  }
                },
                {
                  example: {
                    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/xr/v1'],
                    // various Ethereal Engine user preferences
                    type: 'UserPreferencesCredential'
                  }
                }
              ]
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

  const enableWalletLogin = false // authState?.didWallet

  const enableSocial =
    authState?.discord ||
    authState?.facebook ||
    authState?.github ||
    authState?.google ||
    authState?.linkedin ||
    authState?.twitter

  const enableConnect = authState?.emailMagicLink || authState?.smsMagicLink

  return (
    <Menu open isPopover={isPopover} onClose={() => changeActiveMenu && changeActiveMenu(Views.Closed)}>
      <Box className={styles.menuContent}>
        <Box className={styles.profileContainer}>
          <Avatar
            imageSrc={getAvatarURLForUser(userAvatarDetails, userId)}
            showChangeButton={allowAvatarChange && changeActiveMenu ? true : false}
            onChange={() => changeActiveMenu && changeActiveMenu(Views.AvatarSelect)}
          />

          <Box className={styles.profileDetails}>
            <Text variant="body2">
              {hasAdminAccess ? t('user:usermenu.profile.youAreAn') : t('user:usermenu.profile.youAreA')}
              <span className={commonStyles.bold}>{hasAdminAccess ? ' Admin' : isGuest ? ' Guest' : ' User'}</span>.
            </Text>

            {selfUser?.inviteCode.value && (
              <Text mt={1} variant="body2">
                {t('user:usermenu.profile.inviteCode')}: {selfUser.inviteCode.value}
              </Text>
            )}

            <Text id="show-user-id" mt={1} variant="body2" onClick={() => setShowUserId(!showUserId)}>
              {showUserId ? t('user:usermenu.profile.hideUserId') : t('user:usermenu.profile.showUserId')}
            </Text>

            {selfUser?.apiKey?.id && (
              <Text variant="body2" mt={1} onClick={() => setShowApiKey(!showApiKey)}>
                {showApiKey ? t('user:usermenu.profile.hideApiKey') : t('user:usermenu.profile.showApiKey')}
              </Text>
            )}

            {!isGuest && (
              <Text variant="body2" mt={1} onClick={handleLogout}>
                {t('user:usermenu.profile.logout')}
              </Text>
            )}
          </Box>

          {changeActiveMenu && (
            <IconButton
              background="var(--textColor)"
              sizePx={80}
              icon={
                <Icon
                  type="Settings"
                  sx={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    margin: 'auto',
                    color: 'var(--inputBackground)'
                  }}
                />
              }
              onClick={() => changeActiveMenu(Views.Settings)}
            />
          )}
        </Box>

        <InputText
          name="username"
          label={t('user:usermenu.profile.lbl-username')}
          value={username || ''}
          error={errorUsername}
          sx={{ mt: 4 }}
          endIcon={<Icon type="Check" />}
          onEndIconClick={updateUserName}
          onChange={handleUsernameChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') updateUserName(e)
          }}
        />

        {showUserId && (
          <InputText
            id="user-id"
            label={t('user:usermenu.profile.userIcon.userId')}
            value={userId}
            sx={{ mt: 2 }}
            endIcon={<Icon type="ContentCopy" />}
            onEndIconClick={() => {
              navigator.clipboard.writeText(userId)
              NotificationService.dispatchNotify(t('user:usermenu.profile.userIdCopied'), {
                variant: 'success'
              })
            }}
          />
        )}

        {showApiKey && (
          <InputText
            label={t('user:usermenu.profile.apiKey')}
            value={apiKey}
            sx={{ mt: 2 }}
            endIcon={<Icon type="ContentCopy" />}
            startIcon={<Icon type="Refresh" />}
            startIconTitle={t('user:usermenu.profile.refreshApiKey')}
            onStartIconClick={refreshApiKey}
            onEndIconClick={() => {
              navigator.clipboard.writeText(apiKey)
              NotificationService.dispatchNotify(t('user:usermenu.profile.apiKeyCopied'), {
                variant: 'success'
              })
            }}
          />
        )}

        {!hideLogin && (
          <>
            {isGuest && enableConnect && (
              <>
                <InputText
                  label={getConnectText()}
                  value={apiKey}
                  placeholder={getConnectPlaceholder()}
                  error={error ? getErrorText() : undefined}
                  sx={{ mt: 2 }}
                  endIcon={<Icon type="Send" />}
                  onEndIconClick={handleGuestSubmit}
                  onBlur={validate}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleGuestSubmit(e)
                  }}
                />

                {loading && (
                  <Box display="flex" justifyContent="center">
                    <CircularProgress size={30} />
                  </Box>
                )}
              </>
            )}

            {isGuest && enableWalletLogin && (
              <>
                <Text align="center" variant="body2" mb={1} mt={2}>
                  {t('user:usermenu.profile.or')}
                </Text>

                {enableWalletLogin && (
                  <Box display="flex" flexDirection="column" alignItems="center">
                    <Button type="gradientRounded" onClick={() => handleWalletLoginClick()}>
                      {t('user:usermenu.profile.loginWithXRWallet')}
                    </Button>

                    <Box display="flex" columnGap={2} alignItems="center">
                      <Button type="gradientRounded" onClick={() => handleIssueCredentialClick()}>
                        {t('user:usermenu.profile.issueVC')}
                      </Button>

                      <Button type="gradientRounded" onClick={() => handleRequestCredentialClick()}>
                        {t('user:usermenu.profile.requestVC')}
                      </Button>
                    </Box>
                  </Box>
                )}
              </>
            )}

            {enableSocial && (
              <>
                {selfUser?.isGuest.value && (
                  <Text align="center" variant="body2" mb={1} mt={2}>
                    {t('user:usermenu.profile.addSocial')}
                  </Text>
                )}

                <div className={styles.socialContainer}>
                  {authState?.discord && !oauthConnectedState.discord && (
                    <IconButton
                      id="discord"
                      icon={<DiscordIcon viewBox="0 0 40 40" />}
                      onClick={handleOAuthServiceClick}
                    />
                  )}
                  {authState?.google && !oauthConnectedState.google && (
                    <IconButton
                      id="google"
                      icon={<GoogleIcon viewBox="0 0 40 40" />}
                      onClick={handleOAuthServiceClick}
                    />
                  )}
                  {authState?.facebook && !oauthConnectedState.facebook && (
                    <IconButton
                      id="facebook"
                      icon={<FacebookIcon width="40" height="40" viewBox="0 0 40 40" />}
                      onClick={handleOAuthServiceClick}
                    />
                  )}
                  {authState?.linkedin && !oauthConnectedState.linkedin && (
                    <IconButton
                      id="linkedin"
                      icon={<LinkedInIcon viewBox="0 0 40 40" />}
                      onClick={handleOAuthServiceClick}
                    />
                  )}
                  {authState?.twitter && !oauthConnectedState.twitter && (
                    <IconButton
                      id="twitter"
                      icon={<TwitterIcon width="40" height="40" viewBox="0 0 40 40" />}
                      onClick={handleOAuthServiceClick}
                    />
                  )}
                  {authState?.github && !oauthConnectedState.github && (
                    <IconButton id="github" icon={<Icon type="GitHub" />} onClick={handleOAuthServiceClick} />
                  )}
                </div>

                {!selfUser?.isGuest.value && removeSocial && (
                  <Text align="center" variant="body2" mb={1} mt={2}>
                    {t('user:usermenu.profile.removeSocial')}
                  </Text>
                )}

                <div className={styles.socialContainer}>
                  {authState?.discord && oauthConnectedState.discord && (
                    <IconButton
                      id="discord"
                      icon={<DiscordIcon viewBox="0 0 40 40" />}
                      onClick={handleRemoveOAuthServiceClick}
                    />
                  )}
                  {authState?.google && oauthConnectedState.google && (
                    <IconButton
                      id="google"
                      icon={<GoogleIcon viewBox="0 0 40 40" />}
                      onClick={handleRemoveOAuthServiceClick}
                    />
                  )}
                  {authState?.facebook && oauthConnectedState.facebook && (
                    <IconButton
                      id="facebook"
                      icon={<Icon type="Facebook" viewBox="0 0 40 40" />}
                      onClick={handleRemoveOAuthServiceClick}
                    />
                  )}
                  {authState?.linkedin && oauthConnectedState.linkedin && (
                    <IconButton
                      id="linkedin"
                      icon={<LinkedInIcon viewBox="0 0 40 40" />}
                      onClick={handleRemoveOAuthServiceClick}
                    />
                  )}
                  {authState?.twitter && oauthConnectedState.twitter && (
                    <IconButton
                      id="twitter"
                      icon={<Icon type="Twitter" viewBox="0 0 40 40" />}
                      onClick={handleRemoveOAuthServiceClick}
                    />
                  )}
                  {authState?.github && oauthConnectedState.github && (
                    <IconButton id="github" icon={<Icon type="GitHub" />} onClick={handleRemoveOAuthServiceClick} />
                  )}
                </div>
              </>
            )}

            {!isGuest && (
              <Text id="delete-account" mb={1} variant="body2" onClick={() => setShowDeleteAccount(true)}>
                {t('user:usermenu.profile.delete.deleteAccount')}
              </Text>
            )}

            {showDeleteAccount && (
              <ConfirmDialog
                open
                description={
                  <>
                    <Text variant="body2">{t('user:usermenu.profile.delete.deleteControlsText')}</Text>
                    <Text variant="body2" color="red" mt={2}>
                      {t('user:usermenu.profile.delete.finalDeleteText')}
                    </Text>
                  </>
                }
                submitButtonText={t('user:usermenu.profile.delete.finalDeleteConfirm')}
                onClose={() => setShowDeleteAccount(false)}
                onSubmit={() => {
                  AuthService.removeUser(userId)
                  AuthService.logoutUser()
                  setShowDeleteAccount(false)
                }}
              />
            )}
          </>
        )}
      </Box>
    </Menu>
  )
}

export default ProfileMenu
