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

import { AuthenticationResult } from '@feathersjs/authentication'
import { Paginated } from '@feathersjs/feathers'
import i18n from 'i18next'
import { useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { API } from '@ir-engine/common/src/API'
import config, { validateEmail, validatePhoneNumber } from '@ir-engine/common/src/config'
import { AuthUserSeed, resolveAuthUser } from '@ir-engine/common/src/interfaces/AuthUser'
import multiLogger from '@ir-engine/common/src/logger'
import {
  AuthStrategiesType,
  IdentityProviderType,
  InstanceID,
  UserApiKeyType,
  UserAvatarPatch,
  UserID,
  UserName,
  UserPatch,
  UserPublicPatch,
  UserSettingType,
  UserType,
  avatarPath,
  generateTokenPath,
  identityProviderPath,
  loginPath,
  loginTokenPath,
  magicLinkPath,
  userApiKeyPath,
  userAvatarPath,
  userPath,
  userSettingPath
} from '@ir-engine/common/src/schema.type.module'
import type { HasAccessType } from '@ir-engine/common/src/schemas/networking/allowed-domains.schema'
import {
  HyperFlux,
  defineState,
  getMutableState,
  getState,
  stateNamespaceKey,
  syncStateWithLocalStorage,
  useHookstate
} from '@ir-engine/hyperflux'
import { MessageResponse, ParentCommunicator } from '../../common/iframeCOM'
import { NotificationService } from '../../common/services/NotificationService'

export const logger = multiLogger.child({ component: 'client-core:AuthService' })
export const TIMEOUT_INTERVAL = 50 // ms per interval of waiting for authToken to be updated

const iframe = document.getElementById('root-cookie-accessor') as HTMLIFrameElement
const communicator = new ParentCommunicator('root-cookie-accessor', config.client.clientUrl) //Eventually we can configure iframe target seperatly

export const UserSeed: UserType = {
  id: '' as UserID,
  name: '' as UserName,
  isGuest: true,
  acceptedTOS: false,
  createdAt: '',
  updatedAt: ''
}

const invalidDomainHandling = (error: MessageResponse): void => {
  if (error?.data?.invalidDomain) {
    try {
      localStorage.setItem('invalidCrossOriginDomain', 'true')
    } catch (err) {
      console.log('Was not able to read invalid Domain messaging', err)
    }
  }
}

const waitForToken = (win: Window, clientUrl: string): Promise<string> => {
  return communicator
    .sendMessage('get', {
      key: `${stateNamespaceKey}.AuthState.authUser`
    })
    .then((response) => {
      if (response.success) {
        try {
          const data = JSON.parse(response.data) //this is cookie data(e.data.data) so it's a string
          if (data?.accessToken != null) {
            return data?.accessToken
          }
          return ''
        } catch {
          return '' // Failed to parse token from cookie
        }
      } else {
        return '' // didn't get data but can't guarantee
      }
    })
    .catch((message) => {
      if (message instanceof SyntaxError) {
        throw message
      }
      invalidDomainHandling(message)
      return message
    })
}

const getToken = async (): Promise<string> => {
  let win
  try {
    win = iframe!.contentWindow
  } catch (e) {
    win = iframe!.contentWindow
  }

  const clientUrl = config.client.clientUrl
  const hasAccess = (await communicator
    .sendMessage('checkAccess')
    .then((message) => {
      if (message?.data?.skipCrossOriginCookieCheck === true || message?.data?.storageAccessPermission === 'denied')
        localStorage.setItem('skipCrossOriginCookieCheck', 'true')
      return message.data
    })
    .catch((message) => {
      invalidDomainHandling(message)
      return {}
    })) as HasAccessType

  if (!hasAccess?.cookieSet || !hasAccess?.hasStorageAccess) {
    const skipCheck = localStorage.getItem('skipCrossOriginCookieCheck')
    const invalidCrossOriginDomain = localStorage.getItem('invalidCrossOriginDomain')
    if (skipCheck === 'true' || invalidCrossOriginDomain === 'true') {
      const authState = getMutableState(AuthState)
      const accessToken = authState?.authUser?.accessToken?.value
      return Promise.resolve(accessToken?.length > 0 ? accessToken : '')
    } else {
      iframe.style.display = 'block'
      iframe.style.visibility = 'visible'
      return new Promise((resolve) => {
        const clickResponseListener = async function (e) {
          if (e.origin !== config.client.clientUrl || e.source !== iframe.contentWindow) return
          try {
            const data = e?.data?.data
            if (data.skipCrossOriginCookieCheck === true || data.storageAccessPermission === 'denied') {
              localStorage.setItem('skipCrossOriginCookieCheck', 'true')
              iframe.style.display = 'none'
              iframe.style.visibility = 'hidden'
              resolve('')
            } else {
              const token = waitForToken(win, clientUrl)
              iframe.style.display = 'none'
              iframe.style.visibility = 'hidden'
              resolve(token)
            }
          } catch (err) {
            //Do nothing
            resolve('')
          } finally {
            window.removeEventListener('message', clickResponseListener)
          }
        }
        window.addEventListener('message', clickResponseListener)
      })
    }
  } else {
    return waitForToken(win, clientUrl)
  }
}

export const AuthState = defineState({
  name: 'AuthState',
  initial: () => ({
    isLoggedIn: false,
    isProcessing: false,
    error: '',
    authUser: AuthUserSeed,
    user: UserSeed
  }),
  extension: syncStateWithLocalStorage(['authUser'])
})

export interface EmailLoginForm {
  email: string
  password: string
}

export interface EmailRegistrationForm {
  email: string
  password: string
}

export interface AppleLoginForm {
  email: string
}

export interface GithubLoginForm {
  email: string
}

export interface LinkedInLoginForm {
  email: string
}

export const writeAuthUserToIframe = async () => {
  if (localStorage.getItem('skipCrossOriginCookieCheck') === 'true') return
  const iframe = document.getElementById('root-cookie-accessor') as HTMLFrameElement
  let win
  try {
    win = iframe!.contentWindow
  } catch (e) {
    win = iframe!.contentWindow
  }

  await communicator
    .sendMessage('set', {
      key: `${stateNamespaceKey}.${AuthState.name}.authUser`,
      data: getState(AuthState).authUser
    })
    .catch((message) => {
      invalidDomainHandling(message)
    })
}

/**
 * Resets the current user's accessToken to a new random guest token.
 */
async function _resetToGuestToken(options = { reset: true }) {
  if (options.reset) {
    await API.instance.authentication.reset()
  }
  const newProvider = await API.instance.service(identityProviderPath).create({
    type: 'guest',
    token: uuidv4(),
    userId: '' as UserID
  })
  const accessToken = newProvider.accessToken!
  await API.instance.authentication.setAccessToken(accessToken as string)
  writeAuthUserToIframe()
  return accessToken
}

export const AuthService = {
  async doLoginAuto(forceClientAuthReset?: boolean) {
    // Oauth callbacks may be running when a guest identity-provider has been deleted.
    // This would normally cause doLoginAuto to make a guest user, which we do not want.
    // Instead, just skip it on oauth callbacks, and the callback handler will log them in.
    // The client and auth settings will not be needed on these routes
    if (location.pathname.startsWith('/auth')) return
    const authState = getMutableState(AuthState)
    try {
      const rootDomainToken = await getToken()

      if (forceClientAuthReset) await API.instance.authentication.reset()

      if (rootDomainToken?.length > 0) await API.instance.authentication.setAccessToken(rootDomainToken as string)
      else await _resetToGuestToken({ reset: false })

      let res: AuthenticationResult
      try {
        res = await API.instance.reAuthenticate()
      } catch (err) {
        if (
          err.className === 'not-found' ||
          (err.className === 'not-authenticated' && err.message === 'jwt expired') ||
          (err.className === 'not-authenticated' && err.message === 'invalid algorithm') ||
          (err.className === 'not-authenticated' && err.message === 'invalid signature')
        ) {
          authState.merge({ isLoggedIn: false, user: UserSeed, authUser: AuthUserSeed })
          await _resetToGuestToken()
          res = await API.instance.reAuthenticate()
        } else {
          logger.error(err, 'Error re-authenticating')
          throw err
        }
      }
      if (res) {
        const identityProvider = res[identityProviderPath] as IdentityProviderType
        // Response received form reAuthenticate(), but no `id` set.
        if (!identityProvider?.id) {
          authState.merge({ isLoggedIn: false, user: UserSeed, authUser: AuthUserSeed })
          await _resetToGuestToken()
          res = await API.instance.reAuthenticate()
        }
        const authUser = resolveAuthUser(res)
        // authUser is now { accessToken, authentication, identityProvider }
        authState.merge({ authUser })
        writeAuthUserToIframe()
        await AuthService.loadUserData(authUser.identityProvider.userId)
      } else {
        logger.warn('No response received from reAuthenticate()!')
      }
    } catch (err) {
      logger.error(err, 'Error on resolving auth user in doLoginAuto, logging out')
      authState.merge({ isLoggedIn: false, user: UserSeed, authUser: AuthUserSeed })
      writeAuthUserToIframe()

      // if (window.location.pathname !== '/') {
      //   window.location.href = '/';
      // }
    }
  },

  async loadUserData(userId: UserID) {
    try {
      const client = API.instance
      const user = await client.service(userPath).get(userId)

      const settingsRes = (await client
        .service(userSettingPath)
        .find({ query: { userId: userId } })) as Paginated<UserSettingType>

      if (settingsRes.total === 0) {
        await client.service(userSettingPath).create({ userId: userId })
      }
      const avatar = await client.service(userAvatarPath).find({ query: { userId } })
      if (!avatar.data[0]) {
        const avatars = await client.service(avatarPath).find({
          query: {
            isPublic: true
          }
        })

        if (avatars.data.length > 0) {
          const randomReplacementAvatar = avatars.data[Math.floor(Math.random() * avatars.data.length)]

          await client
            .service(userAvatarPath)
            .patch(null, { avatarId: randomReplacementAvatar.id }, { query: { userId: userId } })
        } else {
          throw new Error('No avatars found in database')
        }
      }
      getMutableState(AuthState).merge({ isLoggedIn: true, user })
    } catch (err) {
      NotificationService.dispatchNotify(i18n.t('common:error.loading-error').toString(), { variant: 'error' })
      console.error(err)
    }
  },

  async loginUserByPassword(form: EmailLoginForm) {
    // check email validation.
    if (!validateEmail(form.email)) {
      NotificationService.dispatchNotify(
        i18n.t('common:error.validation-error', { type: 'email address' }).toString(),
        {
          variant: 'error'
        }
      )

      return
    }
    const authState = getMutableState(AuthState)
    authState.merge({ isProcessing: true, error: '' })

    try {
      const authenticationResult = await API.instance.authenticate({
        strategy: 'local',
        email: form.email,
        password: form.password
      })
      const authUser = resolveAuthUser(authenticationResult)

      authState.merge({ authUser })
      await AuthService.loadUserData(authUser.identityProvider.userId)
      window.location.href = '/'
    } catch (err) {
      authState.merge({ error: i18n.t('common:error.login-error') })
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    } finally {
      authState.merge({ isProcessing: false, error: '' })
    }
  },

  /**
   * Example vprResult:
   * {
   *   "type": "web",
   *   "dataType": "VerifiablePresentation",
   *   "data": {
   *     "presentation": {
   *       "holder": "did:web:example.com",
   *       "verifiableCredential": [
   *       ]
   *     }
   *   },
   *   "options": {
   *     "recommendedHandlerOrigins: ["https://uniwallet.cloud"]
   *   }
   * }
   * Where `vp` is a VerifiablePresentation containing multiple VCs
   * (LoginDisplayCredential, UserPreferencesCredential).
   *
   * @param vprResult {object} - VPR Query result from a user's wallet.
   */
  // async loginUserByXRWallet(vprResult: any) {
  //   const authState = getMutableState(AuthState)
  //   try {
  //     authState.merge({ isProcessing: true, error: '' })

  //     const credentials: any = parseUserWalletCredentials(vprResult)
  //     console.log(credentials)

  //     const walletUser = resolveWalletUser(credentials)
  //     const authUser = {
  //       accessToken: '',
  //       authentication: { strategy: 'did-auth' },
  //       identityProvider: {
  //         id: '',
  //         token: '',
  //         type: 'didWallet',
  //         userId: walletUser.id,
  //         createdAt: '',
  //         updatedAt: ''
  //       }
  //     }

  //     // TODO: This is temp until we move completely to XR wallet #6453
  //     const oldId = authState.user.id.value
  //     walletUser.id = oldId

  //     // loadXRAvatarForUpdatedUser(walletUser)
  //     authState.merge({ isLoggedIn: true, user: walletUser, authUser })
  //   } catch (err) {
  //     authState.merge({ error: i18n.t('common:error.login-error') })
  //     NotificationService.dispatchNotify(err.message, { variant: 'error' })
  //   } finally {
  //     authState.merge({ isProcessing: false, error: '' })
  //   }
  // },

  /**
   * Logs in the current user based on an OAuth response.
   */
  async loginUserByOAuth(service: string, location: any, isSignUp: boolean, redirectUrl?: string) {
    getMutableState(AuthState).merge({ isProcessing: true, error: '' })
    const token = getState(AuthState).authUser.accessToken
    const path = redirectUrl || new URLSearchParams(location.search).get('redirectUrl') || location.pathname

    const redirectConfig = {
      path
    } as Record<string, string>

    const currentUrl = new URL(window.location.href)
    const domain = currentUrl.protocol.concat('//').concat(currentUrl.host)
    const instanceId = (currentUrl.searchParams.get('instanceId') as InstanceID) || null

    if (instanceId) redirectConfig.instanceId = instanceId
    if (domain) redirectConfig.domain = domain
    const action = isSignUp == false ? 'signin' : 'signup'

    window.location.href = `${
      config.client.serverUrl
    }/oauth/${service}?feathers_token=${token}&redirect=${JSON.stringify(redirectConfig)}&action=${encodeURIComponent(
      action
    )}`
  },

  async removeUserOAuth(service: string) {
    const ipResult = (await API.instance.service(identityProviderPath).find()) as Paginated<IdentityProviderType>
    const ipToRemove = ipResult.data.find((ip) => ip.type === service)
    if (ipToRemove) {
      if (ipResult.total === 1) {
        NotificationService.dispatchNotify('You can not remove your last login method.', { variant: 'warning' })
      } else {
        const otherIp = ipResult.data.find((ip) => ip.type !== service)
        const newTokenResult = await API.instance.service(generateTokenPath).create({
          type: otherIp!.type,
          token: otherIp!.token
        })

        if (newTokenResult?.token) {
          getMutableState(AuthState).merge({ isProcessing: true, error: '' })
          await API.instance.authentication.setAccessToken(newTokenResult.token)
          const res = await API.instance.reAuthenticate(true)
          const authUser = resolveAuthUser(res)
          await API.instance.service(identityProviderPath).remove(ipToRemove.id)
          const authState = getMutableState(AuthState)
          authState.merge({ authUser })
          await AuthService.loadUserData(authUser.identityProvider.userId)
          authState.merge({ isProcessing: false, error: '' })
        }
      }
    }
  },

  async loginUserByJwt(accessToken: string, redirectSuccess: string, redirectError: string) {
    const authState = getMutableState(AuthState)
    authState.merge({ isProcessing: true, error: '' })
    try {
      await API.instance.authentication.setAccessToken(accessToken as string)
      const res = await API.instance.authenticate({
        strategy: 'jwt',
        accessToken
      })

      const authUser = resolveAuthUser(res)
      authState.merge({ authUser })
      writeAuthUserToIframe()
      await AuthService.loadUserData(authUser.identityProvider?.userId)
      authState.merge({ isProcessing: false, error: '' })
      let timeoutTimer = 0
      // The new JWT does not always get stored in localStorage successfully by this point, and if the user is
      // redirected to redirectSuccess now, they will still have an old JWT, which can cause them to not be logged
      // in properly. This interval waits to make sure the token has been updated before redirecting
      const waitForTokenStored = setInterval(() => {
        timeoutTimer += TIMEOUT_INTERVAL
        const storedToken = authState.authUser?.accessToken?.value
        if (storedToken === accessToken) {
          clearInterval(waitForTokenStored)
          window.location.href = redirectSuccess
        }
        // After 3 seconds without the token getting updated, send the user back anyway - something seems to have
        // gone wrong, and we don't want them stuck on the page they were on indefinitely.
        if (timeoutTimer > 3000) window.location.href = redirectSuccess
      }, TIMEOUT_INTERVAL)
    } catch (err) {
      authState.merge({ error: i18n.t('common:error.login-error') })
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
      window.location.href = `${redirectError}?error=${err.message}`
    } finally {
      authState.merge({ isProcessing: false, error: '' })
    }
  },

  async loginUserMagicLink(token, redirectSuccess, redirectError) {
    try {
      const res = await API.instance.service(loginPath).get(token)
      await AuthService.loginUserByJwt(res.token!, '/', '/')
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    } finally {
      window.location.href = redirectSuccess
    }
  },

  async logoutUser() {
    const authState = getMutableState(AuthState)
    authState.merge({ isProcessing: true, error: '' })
    try {
      await API.instance.logout()
      authState.merge({ isLoggedIn: false, user: UserSeed, authUser: AuthUserSeed })
    } catch (_) {
      authState.merge({ isLoggedIn: false, user: UserSeed, authUser: AuthUserSeed })
    } finally {
      authState.merge({ isProcessing: false, error: '' })
      writeAuthUserToIframe()
      await new Promise<void>((resolve) => {
        const clientUrl = config.client.clientUrl
        const getIframeResponse = function (e) {
          if (e.origin !== config.client.clientUrl || e.source !== iframe.contentWindow) return
          if (e?.data?.data) {
            try {
              const data = e?.data?.data
              if (data?.cookieWasSet === `${stateNamespaceKey}.${AuthState.name}.authUser`) {
                window.removeEventListener('message', getIframeResponse)
                resolve()
              }
            } catch {
              resolve()
            }
          }
        }
        window.addEventListener('message', getIframeResponse)
      })
      window.location.reload()
    }
  },

  async registerUserByEmail(form: EmailRegistrationForm) {
    const authState = getMutableState(AuthState)
    authState.merge({ isProcessing: true, error: '' })
    try {
      const identityProvider: any = await API.instance.service(identityProviderPath).create({
        token: form.email,
        type: 'password',
        userId: '' as UserID
      })
      authState.authUser.merge({ identityProvider })
      window.location.href = '/auth/confirm'
    } catch (err) {
      logger.warn(err, 'Error registering user by email')
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    } finally {
      authState.merge({ isProcessing: false, error: '' })
    }
  },

  async createMagicLink(
    emailPhone: string,
    authData: AuthStrategiesType,
    linkType?: 'email' | 'sms',
    redirectUrl?: string
  ) {
    const authState = getMutableState(AuthState)
    authState.merge({ isProcessing: true, error: '' })

    let type = 'email'
    let paramName = 'email'
    const enableEmailMagicLink = authData?.emailMagicLink
    const enableSmsMagicLink = authData?.smsMagicLink

    const storedToken = authState.authUser?.accessToken?.value

    if (linkType === 'email') {
      type = 'email'
      paramName = 'email'
    } else if (linkType === 'sms') {
      type = 'sms'
      paramName = 'mobile'
    } else {
      const stripped = emailPhone.replace(/-/g, '')
      if (validatePhoneNumber(stripped)) {
        if (!enableSmsMagicLink) {
          NotificationService.dispatchNotify(
            i18n.t('common:error.validation-error', { type: 'email address' }).toString(),
            {
              variant: 'error'
            }
          )
          return
        }
        type = 'sms'
        paramName = 'mobile'
        emailPhone = '+1' + stripped
      } else if (validateEmail(emailPhone)) {
        if (!enableEmailMagicLink) {
          NotificationService.dispatchNotify(
            i18n.t('common:error.validation-error', { type: 'phone number' }).toString(),
            {
              variant: 'error'
            }
          )
          return
        }
        type = 'email'
      } else {
        NotificationService.dispatchNotify(
          i18n.t('common:error.validation-error', { type: 'email or phone number' }).toString(),
          {
            variant: 'error'
          }
        )
        return
      }
    }

    try {
      await API.instance
        .service(magicLinkPath)
        .create({ type, [paramName]: emailPhone, accessToken: storedToken, redirectUrl })
      const message = {
        email: 'email-sent-msg',
        sms: 'sms-sent-msg',
        default: 'success-msg'
      }
      NotificationService.dispatchNotify(i18n.t(`user:auth.magiklink.${message[type ?? 'default']}`).toString(), {
        variant: 'success'
      })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
      throw new Error(err)
    } finally {
      authState.merge({ isProcessing: false, error: '' })
    }
  },

  async validateUser(email: string): Promise<boolean> {
    try {
      const identityProviders = await API.instance.service(identityProviderPath).find({
        query: {
          email: email.toLowerCase()
        }
      })

      return identityProviders.data.length > 0
    } catch (error) {
      return false
    }
  },

  async addConnectionByPassword(form: EmailLoginForm) {
    const authState = getMutableState(AuthState)
    authState.merge({ isProcessing: true, error: '' })

    try {
      const identityProvider = await API.instance.service(identityProviderPath).create({
        token: form.email,
        type: 'password',
        userId: '' as UserID
      })
      return AuthService.loadUserData(identityProvider.userId)
    } catch (err) {
      logger.warn(err, 'Error adding connection by password')
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    } finally {
      authState.merge({ isProcessing: false, error: '' })
    }
  },

  async addConnectionByEmail(email: string, userId: UserID) {
    const authState = getMutableState(AuthState)
    authState.merge({ isProcessing: true, error: '' })
    try {
      const identityProvider = (await API.instance.service(magicLinkPath).create({
        email,
        type: 'email',
        userId
      })) as IdentityProviderType
      if (identityProvider.userId) {
        NotificationService.dispatchNotify(i18n.t('user:auth.magiklink.email-sent-msg').toString(), {
          variant: 'success'
        })
        return AuthService.loadUserData(identityProvider.userId)
      }
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    } finally {
      authState.merge({ isProcessing: false, error: '' })
    }
  },

  async addConnectionBySms(phone: string, userId: UserID) {
    const authState = getMutableState(AuthState)
    authState.merge({ isProcessing: true, error: '' })

    let sendPhone = phone.replace(/-/g, '')
    if (sendPhone.length === 10) {
      sendPhone = '1' + sendPhone
    }

    try {
      const identityProvider = (await API.instance.service(magicLinkPath).create({
        mobile: sendPhone,
        type: 'sms',
        userId
      })) as IdentityProviderType
      if (identityProvider.userId) {
        NotificationService.dispatchNotify(i18n.t('user:auth.magiklink.sms-sent-msg').toString(), { variant: 'error' })
        return AuthService.loadUserData(identityProvider.userId)
      }
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    } finally {
      authState.merge({ isProcessing: false, error: '' })
    }
  },

  async addConnectionByOauth(
    oauth: 'apple' | 'facebook' | 'google' | 'github' | 'linkedin' | 'twitter' | 'discord',
    userId: UserID
  ) {
    window.open(`https://${config.client.serverHost}/auth/oauth/${oauth}?userId=${userId}`, '_blank')
  },

  async removeConnection(identityProviderId: number, userId: UserID) {
    getMutableState(AuthState).merge({ isProcessing: true, error: '' })
    try {
      await API.instance.service(identityProviderPath).remove(identityProviderId)
      return AuthService.loadUserData(userId)
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    } finally {
      getMutableState(AuthState).merge({ isProcessing: false, error: '' })
    }
  },

  refreshConnections(userId: UserID) {
    AuthService.loadUserData(userId)
  },

  async removeUser(userId: UserID) {
    await API.instance.service(userPath).remove(userId)
    AuthService.logoutUser()
  },

  async updateApiKey() {
    const userApiKey = (await API.instance.service(userApiKeyPath).find()) as Paginated<UserApiKeyType>

    let apiKey: UserApiKeyType | undefined
    if (userApiKey.data.length > 0) {
      apiKey = await API.instance.service(userApiKeyPath).patch(userApiKey.data[0].id, {})
    } else {
      apiKey = await API.instance.service(userApiKeyPath).create({})
    }
  },

  async createLoginToken() {
    return API.instance.service(loginTokenPath).create({})
  },

  useAPIListeners: () => {
    useEffect(() => {
      const userPatchedListener = (user: UserPublicPatch | UserPatch) => {
        if (!user.id) return

        const selfUser = getMutableState(AuthState).user

        if (selfUser.id.value === user.id) {
          getMutableState(AuthState).user.merge(user)
        }
      }

      const userAvatarPatchedListener = async (userAvatar: UserAvatarPatch) => {
        if (!userAvatar.userId) return

        const selfUser = getMutableState(AuthState).user

        if (selfUser.id.value === userAvatar.userId) {
          const user = await API.instance.service(userPath).get(userAvatar.userId)
          getMutableState(AuthState).user.merge(user)
        }
      }

      API.instance.service(userPath).on('patched', userPatchedListener)
      API.instance.service(userAvatarPath).on('patched', userAvatarPatchedListener)

      return () => {
        API.instance.service(userPath).off('patched', userPatchedListener)
        API.instance.service(userAvatarPath).off('patched', userAvatarPatchedListener)
      }
    }, [])
  }
}

/**
 * @param vprResult {any} See `loginUserByXRWallet()`'s docstring.
 */
// function parseUserWalletCredentials(vprResult: any) {
//   console.log('PARSING:', vprResult)

//   const {
//     data: { presentation: vp }
//   } = vprResult
//   const credentials = Array.isArray(vp.verifiableCredential) ? vp.verifiableCredential : [vp.verifiableCredential]

//   const { displayName, displayIcon } = parseLoginDisplayCredential(credentials)

//   return {
//     user: {
//       id: vp.holder,
//       displayName,
//       icon: displayIcon
//       // session // this will contain the access token and helper methods
//     }
//   }
// }

/**
 * Parses the user's preferred display name (username) and avatar icon from the
 * login credentials.
 *
 * @param credentials {VerifiableCredential[]} List of VCs requested by the
 *   login request. One of those credentials needs to be of type
 *   'LoginDisplayCredential'.
 *
 * @returns {{displayName: string, displayIcon: string}}
 */
function parseLoginDisplayCredential(credentials) {
  const loginDisplayVc = credentials.find((vc) => vc.type.includes('LoginDisplayCredential'))
  const DEFAULT_ICON = 'https://material-ui.com/static/images/avatar/1.jpg'
  const displayName = loginDisplayVc.credentialSubject.displayName || 'Wallet User'
  const displayIcon = loginDisplayVc.credentialSubject.displayIcon || DEFAULT_ICON

  return { displayName, displayIcon }
}

export const useAuthenticated = () => {
  const authState = useHookstate(getMutableState(AuthState))

  useEffect(() => {
    AuthService.doLoginAuto()
    return () => {
      communicator.destroy()
    }
  }, [])

  useEffect(() => {
    HyperFlux.store.userID = authState.user.id.value
  }, [authState.user.id])

  return authState.isLoggedIn.value
}
