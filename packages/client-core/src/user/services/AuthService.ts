import { Paginated } from '@feathersjs/feathers'
import { Downgraded } from '@hookstate/core'
import i18n from 'i18next'
import querystring from 'querystring'
import { useEffect } from 'react'
import { v1 } from 'uuid'

import { validateEmail, validatePhoneNumber } from '@xrengine/common/src/config'
import { serverHost } from '@xrengine/common/src/config'
import { AuthStrategies } from '@xrengine/common/src/interfaces/AuthStrategies'
import { AuthUser, AuthUserSeed, resolveAuthUser } from '@xrengine/common/src/interfaces/AuthUser'
import { IdentityProvider } from '@xrengine/common/src/interfaces/IdentityProvider'
import {
  resolveUser,
  resolveWalletUser,
  UserInterface,
  UserSeed,
  UserSetting
} from '@xrengine/common/src/interfaces/User'
import { UserApiKey } from '@xrengine/common/src/interfaces/UserApiKey'
import multiLogger from '@xrengine/common/src/logger'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import {
  defineAction,
  defineState,
  dispatchAction,
  getState,
  syncStateWithLocalStorage,
  useState
} from '@xrengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'
import { accessLocationState } from '../../social/services/LocationService'
import { userPatched } from '../functions/userPatched'

export const logger = multiLogger.child({ component: 'client-core:AuthService' })
export const TIMEOUT_INTERVAL = 50 // ms per interval of waiting for authToken to be updated

// State
export const AuthState = defineState({
  name: 'AuthState',
  initial: () => ({
    isLoggedIn: false,
    isProcessing: false,
    error: '',
    authUser: AuthUserSeed,
    user: UserSeed
  }),
  onCreate: (store, state) => {
    syncStateWithLocalStorage(AuthState, ['authUser'])
  }
})

export const accessAuthState = () => getState(AuthState)
export const useAuthState = () => useState(accessAuthState())

export interface EmailLoginForm {
  email: string
  password: string
}

export interface EmailRegistrationForm {
  email: string
  password: string
}

export interface GithubLoginForm {
  email: string
}

export interface LinkedInLoginForm {
  email: string
}

export const AuthServiceReceptor = (action) => {
  const s = getState(AuthState)
  matches(action)
    .when(AuthAction.actionProcessing.matches, (action) => {
      return s.merge({ isProcessing: action.processing, error: '' })
    })
    .when(AuthAction.loginUserSuccessAction.matches, (action) => {
      return s.merge({ authUser: action.authUser })
    })
    .when(AuthAction.loadedUserDataAction.matches, (action) => {
      return s.merge({ isLoggedIn: true, user: action.user })
    })
    .when(AuthAction.loginUserErrorAction.matches, (action) => {
      return s.merge({ error: action.message })
    })
    .when(AuthAction.loginUserByGithubSuccessAction.matches, (action) => {
      return s
    })
    .when(AuthAction.loginUserByLinkedinSuccessAction.matches, (action) => {
      return s
    })
    .when(AuthAction.loginUserByGithubErrorAction.matches, (action) => {
      return s.merge({ error: action.message })
    })
    .when(AuthAction.loginUserByLinkedinErrorAction.matches, (action) => {
      return s.merge({ error: action.message })
    })
    .when(AuthAction.registerUserByEmailSuccessAction.matches, (action) => {
      return s.authUser.merge({ identityProvider: action.identityProvider })
    })
    .when(AuthAction.registerUserByEmailErrorAction.matches, (action) => {
      return s
    })
    .when(AuthAction.didLogoutAction.matches, () => {
      return s.merge({ isLoggedIn: false, user: UserSeed, authUser: AuthUserSeed })
    })
    .when(AuthAction.didVerifyEmailAction.matches, (action) => {
      return s.authUser.identityProvider.merge({ isVerified: action.result })
    })
    .when(AuthAction.avatarUpdatedAction.matches, (action) => {
      return s.user.merge({ avatarUrl: action.url })
    })
    .when(AuthAction.usernameUpdatedAction.matches, (action) => {
      return s.user.merge({ name: action.name })
    })
    .when(AuthAction.apiKeyUpdatedAction.matches, (action) => {
      return s.user.merge({ apiKey: action.apiKey })
    })
    .when(AuthAction.userAvatarIdUpdatedAction.matches, (action) => {
      return s.user.merge({ avatarId: action.avatarId })
    })
    .when(AuthAction.userUpdatedAction.matches, (action) => {
      return s.merge({ user: action.user })
    })
    .when(AuthAction.userPatchedAction.matches, (action) => {
      return userPatched(action.params)
    })
    .when(AuthAction.updatedUserSettingsAction.matches, (action) => {
      return s.user.merge({ user_setting: action.data })
    })
}

export class AuthAction {
  static actionProcessing = defineAction({
    type: 'xre.client.Auth.ACTION_PROCESSING' as const,
    processing: matches.boolean
  })

  static loginUserSuccessAction = defineAction({
    type: 'xre.client.Auth.LOGIN_USER_SUCCESS' as const,
    authUser: matches.object as Validator<unknown, AuthUser>,
    message: matches.string
  })

  static loginUserErrorAction = defineAction({
    type: 'xre.client.Auth.LOGIN_USER_ERROR' as const,
    message: matches.string
  })

  static loginUserByGithubSuccessAction = defineAction({
    type: 'xre.client.Auth.LOGIN_USER_BY_GITHUB_SUCCESS' as const,
    message: matches.string
  })

  static loginUserByGithubErrorAction = defineAction({
    type: 'xre.client.Auth.LOGIN_USER_BY_GITHUB_ERROR' as const,
    message: matches.string
  })

  static loginUserByLinkedinSuccessAction = defineAction({
    type: 'xre.client.Auth.LOGIN_USER_BY_LINKEDIN_SUCCESS' as const,
    message: matches.string
  })

  static loginUserByLinkedinErrorAction = defineAction({
    type: 'xre.client.Auth.LOGIN_USER_BY_LINKEDIN_ERROR' as const,
    message: matches.string
  })

  static didLogoutAction = defineAction({
    type: 'xre.client.Auth.LOGOUT_USER' as const
  })

  static registerUserByEmailSuccessAction = defineAction({
    type: 'xre.client.Auth.REGISTER_USER_BY_EMAIL_SUCCESS' as const,
    identityProvider: matches.object as Validator<unknown, IdentityProvider>,
    message: matches.string
  })

  static registerUserByEmailErrorAction = defineAction({
    type: 'xre.client.Auth.REGISTER_USER_BY_EMAIL_ERROR' as const,
    message: matches.string
  })

  static didVerifyEmailAction = defineAction({
    type: 'xre.client.Auth.DID_VERIFY_EMAIL' as const,
    result: matches.boolean
  })

  static didResendVerificationEmailAction = defineAction({
    type: 'xre.client.Auth.DID_RESEND_VERIFICATION_EMAIL' as const,
    result: matches.boolean
  })

  static didForgotPasswordAction = defineAction({
    type: 'xre.client.Auth.DID_FORGOT_PASSWORD' as const,
    result: matches.boolean
  })

  static didResetPasswordAction = defineAction({
    type: 'xre.client.Auth.DID_RESET_PASSWORD' as const,
    result: matches.boolean
  })

  static didCreateMagicLinkAction = defineAction({
    type: 'xre.client.Auth.DID_CREATE_MAGICLINK' as const,
    result: matches.boolean
  })

  static loadedUserDataAction = defineAction({
    type: 'xre.client.Auth.LOADED_USER_DATA' as const,
    user: matches.object as Validator<unknown, UserInterface>
  })

  static updatedUserSettingsAction = defineAction({
    type: 'xre.client.Auth.UPDATE_USER_SETTINGS' as const,
    data: matches.object as Validator<unknown, UserSetting>
  })

  static avatarUpdatedAction = defineAction({
    type: 'xre.client.Auth.AVATAR_UPDATED' as const,
    url: matches.any
  })

  static usernameUpdatedAction = defineAction({
    type: 'xre.client.Auth.USERNAME_UPDATED' as const,
    name: matches.string
  })

  static userAvatarIdUpdatedAction = defineAction({
    type: 'xre.client.Auth.USERAVATARID_UPDATED' as const,
    avatarId: matches.string
  })

  static userPatchedAction = defineAction({
    type: 'xre.client.Auth.USER_PATCHED' as const,
    params: matches.any
  })

  static userUpdatedAction = defineAction({
    type: 'xre.client.Auth.USER_UPDATED' as const,
    user: matches.object as Validator<unknown, UserInterface>
  })

  static apiKeyUpdatedAction = defineAction({
    type: 'xre.client.Auth.USER_API_KEY_UPDATED' as const,
    apiKey: matches.object as Validator<unknown, UserApiKey>
  })
}

/**
 * Resets the current user's accessToken to a new random guest token.
 */
async function _resetToGuestToken(options = { reset: true }) {
  if (options.reset) {
    await API.instance.client.authentication.reset()
  }
  const newProvider = await API.instance.client.service('identity-provider').create({
    type: 'guest',
    token: v1()
  })
  const accessToken = newProvider.accessToken!
  console.log(`Created new guest accessToken: ${accessToken}`)
  await API.instance.client.authentication.setAccessToken(accessToken as string)
  return accessToken
}

// Service
export const AuthService = {
  async doLoginAuto(forceClientAuthReset?: boolean) {
    try {
      const authData = getState(AuthState)
      let accessToken = !forceClientAuthReset && authData?.authUser?.accessToken?.value

      if (forceClientAuthReset) {
        await API.instance.client.authentication.reset()
      }
      if (accessToken) {
        await API.instance.client.authentication.setAccessToken(accessToken as string)
      } else {
        await _resetToGuestToken({ reset: false })
      }

      let res
      try {
        res = await API.instance.client.reAuthenticate()
      } catch (err) {
        if (err.className === 'not-found' || (err.className === 'not-authenticated' && err.message === 'jwt expired')) {
          await dispatchAction(AuthAction.didLogoutAction({}))
          await _resetToGuestToken()
          res = await API.instance.client.reAuthenticate()
        } else {
          logger.error(err, 'Error re-authenticating')
          throw err
        }
      }
      if (res) {
        // Response received form reAuthenticate(), but no `id` set.
        if (!res['identity-provider']?.id) {
          await dispatchAction(AuthAction.didLogoutAction({}))
          await _resetToGuestToken()
          res = await API.instance.client.reAuthenticate()
        }
        const authUser = resolveAuthUser(res)
        // authUser is now { accessToken, authentication, identityProvider }

        dispatchAction(AuthAction.loginUserSuccessAction({ authUser, message: '' }))
        await AuthService.loadUserData(authUser.identityProvider?.userId)
      } else {
        logger.warn('No response received from reAuthenticate()!')
      }
    } catch (err) {
      logger.error(err, 'Error on resolving auth user in doLoginAuto, logging out')
      dispatchAction(AuthAction.didLogoutAction({}))

      // if (window.location.pathname !== '/') {
      //   window.location.href = '/';
      // }
    }
  },

  async loadUserData(userId: string) {
    try {
      const client = API.instance.client
      const res: any = await client.service('user').get(userId)
      if (!res.user_setting) {
        const settingsRes = (await client
          .service('user-settings')
          .find({ query: { userId: userId } })) as Paginated<UserSetting>

        if (settingsRes.total === 0) {
          res.user_setting = await client.service('user-settings').create({ userId: userId })
        } else {
          res.user_setting = settingsRes.data[0]
        }
      }
      const user = resolveUser(res)
      dispatchAction(AuthAction.loadedUserDataAction({ user }))
    } catch (err) {
      NotificationService.dispatchNotify(i18n.t('common:error.loading-error'), { variant: 'error' })
    }
  },

  async loginUserByPassword(form: EmailLoginForm) {
    // check email validation.
    if (!validateEmail(form.email)) {
      NotificationService.dispatchNotify(i18n.t('common:error.validation-error', { type: 'email address' }), {
        variant: 'error'
      })

      return
    }

    dispatchAction(AuthAction.actionProcessing({ processing: true }))

    try {
      const authenticationResult = await API.instance.client.authenticate({
        strategy: 'local',
        email: form.email,
        password: form.password
      })
      const authUser = resolveAuthUser(authenticationResult)

      if (!authUser.identityProvider?.isVerified) {
        await API.instance.client.logout()
        dispatchAction(
          AuthAction.registerUserByEmailSuccessAction({ identityProvider: authUser.identityProvider, message: '' })
        )
        window.location.href = '/auth/confirm'
        return
      }

      dispatchAction(AuthAction.loginUserSuccessAction({ authUser: authUser, message: '' }))
      await AuthService.loadUserData(authUser.identityProvider.userId)
      window.location.href = '/'
    } catch (err) {
      dispatchAction(AuthAction.loginUserErrorAction({ message: i18n.t('common:error.login-error') }))
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    } finally {
      dispatchAction(AuthAction.actionProcessing({ processing: false }))
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
  async loginUserByXRWallet(vprResult: any) {
    try {
      dispatchAction(AuthAction.actionProcessing({ processing: true }))

      const credentials: any = parseUserWalletCredentials(vprResult)
      console.log(credentials)

      const walletUser = resolveWalletUser(credentials)
      const authUser = {
        accessToken: '',
        authentication: { strategy: 'did-auth' },
        identityProvider: {
          id: 0,
          token: '',
          type: 'didWallet',
          isVerified: true,
          userId: walletUser.id
        }
      }

      // TODO: This is temp until we move completely to XR wallet
      const oldId = accessAuthState().user.id.value
      walletUser.id = oldId

      // loadXRAvatarForUpdatedUser(walletUser) // TODO
      dispatchAction(AuthAction.loadedUserDataAction({ user: walletUser }))
      dispatchAction(AuthAction.loginUserSuccessAction({ authUser: authUser, message: '' }))
    } catch (err) {
      dispatchAction(AuthAction.loginUserErrorAction({ message: i18n.t('common:error.login-error') }))
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    } finally {
      dispatchAction(AuthAction.actionProcessing({ processing: false }))
    }
  },

  /**
   * Logs in the current user based on an OAuth response.
   * @param service {string} - OAuth service id (github, etc).
   * @param location {object} - `useLocation()` from 'react-router-dom'
   */
  async loginUserByOAuth(service: string, location: any) {
    dispatchAction(AuthAction.actionProcessing({ processing: true }))
    const token = accessAuthState().authUser.accessToken.value
    const path = location?.state?.from || location.pathname
    const queryString = querystring.parse(window.location.search.slice(1))
    const redirectObject = {
      path: path
    } as any
    if (queryString.instanceId && queryString.instanceId.length > 0) redirectObject.instanceId = queryString.instanceId
    window.location.href = `${serverHost}/oauth/${service}?feathers_token=${token}&redirect=${JSON.stringify(
      redirectObject
    )}`
  },

  async removeUserOAuth(service: string) {
    const ipResult = (await API.instance.client.service('identity-provider').find()) as any
    const ipToRemove = ipResult.data.find((ip) => ip.type === service)
    if (ipToRemove) {
      if (ipResult.total === 1) {
        NotificationService.dispatchNotify('You can not remove your last login method.', { variant: 'warning' })
      } else {
        const otherIp = ipResult.data.find((ip) => ip.type !== service)
        const newToken = await API.instance.client.service('generate-token').create({
          type: otherIp.type,
          token: otherIp.token
        })

        if (newToken) {
          dispatchAction(AuthAction.actionProcessing({ processing: true }))
          await API.instance.client.authentication.setAccessToken(newToken as string)
          const res = await API.instance.client.reAuthenticate(true)
          const authUser = resolveAuthUser(res)
          await API.instance.client.service('identity-provider').remove(ipToRemove.id)
          dispatchAction(AuthAction.loginUserSuccessAction({ authUser: authUser, message: '' }))
          await AuthService.loadUserData(authUser.identityProvider.userId)
          dispatchAction(AuthAction.actionProcessing({ processing: false }))
        }
      }
    }
  },

  async loginUserByJwt(accessToken: string, redirectSuccess: string, redirectError: string) {
    dispatchAction(AuthAction.actionProcessing({ processing: true }))
    try {
      await API.instance.client.authentication.setAccessToken(accessToken as string)
      const res = await API.instance.client.authenticate({
        strategy: 'jwt',
        accessToken
      })

      const authUser = resolveAuthUser(res)

      dispatchAction(AuthAction.loginUserSuccessAction({ authUser: authUser, message: '' }))
      await AuthService.loadUserData(authUser.identityProvider?.userId)
      dispatchAction(AuthAction.actionProcessing({ processing: false }))
      let timeoutTimer = 0
      // The new JWT does not always get stored in localStorage successfully by this point, and if the user is
      // redirected to redirectSuccess now, they will still have an old JWT, which can cause them to not be logged
      // in properly. This interval waits to make sure the token has been updated before redirecting
      const waitForTokenStored = setInterval(() => {
        timeoutTimer += TIMEOUT_INTERVAL
        const authData = getState(AuthState)
        const storedToken = authData.authUser?.accessToken?.value
        if (storedToken === accessToken) {
          clearInterval(waitForTokenStored)
          window.location.href = redirectSuccess
        }
        // After 3 seconds without the token getting updated, send the user back anyway - something seems to have
        // gone wrong, and we don't want them stuck on the page they were on indefinitely.
        if (timeoutTimer > 3000) window.location.href = redirectSuccess
      }, TIMEOUT_INTERVAL)
    } catch (err) {
      dispatchAction(AuthAction.loginUserErrorAction({ message: i18n.t('common:error.login-error') }))
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
      window.location.href = `${redirectError}?error=${err.message}`
    } finally {
      dispatchAction(AuthAction.actionProcessing({ processing: false }))
    }
  },

  async loginUserMagicLink(token, redirectSuccess, redirectError) {
    try {
      const res = await API.instance.client.service('login').get(token)
      await AuthService.loginUserByJwt(res.token, '/', '/')
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    } finally {
      window.location.href = redirectSuccess
    }
  },

  async logoutUser() {
    dispatchAction(AuthAction.actionProcessing({ processing: true }))
    try {
      await API.instance.client.logout()
      dispatchAction(AuthAction.didLogoutAction({}))
    } catch (_) {
      dispatchAction(AuthAction.didLogoutAction({}))
    } finally {
      dispatchAction(AuthAction.actionProcessing({ processing: false }))
      AuthService.doLoginAuto(true)
    }
  },

  async registerUserByEmail(form: EmailRegistrationForm) {
    dispatchAction(AuthAction.actionProcessing({ processing: true }))
    try {
      const identityProvider: any = await API.instance.client.service('identity-provider').create({
        token: form.email,
        password: form.password,
        type: 'password'
      })
      dispatchAction(AuthAction.registerUserByEmailSuccessAction({ identityProvider, message: '' }))
      window.location.href = '/auth/confirm'
    } catch (err) {
      logger.warn(err, 'Error registering user by email')
      dispatchAction(AuthAction.registerUserByEmailErrorAction({ message: err.message }))
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    } finally {
      dispatchAction(AuthAction.actionProcessing({ processing: false }))
    }
  },

  async verifyEmail(token: string) {
    dispatchAction(AuthAction.actionProcessing({ processing: true }))

    try {
      const { accessToken } = API.instance.client.service('authManagement').create({
        action: 'verifySignupLong',
        value: token
      })
      dispatchAction(AuthAction.didVerifyEmailAction({ result: true }))
      await AuthService.loginUserByJwt(accessToken, '/', '/')
    } catch (err) {
      dispatchAction(AuthAction.didVerifyEmailAction({ result: false }))
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    } finally {
      dispatchAction(AuthAction.actionProcessing({ processing: false }))
    }
  },

  async resendVerificationEmail(email: string) {
    dispatchAction(AuthAction.actionProcessing({ processing: true }))

    try {
      await API.instance.client.service('authManagement').create({
        action: 'resendVerifySignup',
        value: { token: email, type: 'password' }
      })
      dispatchAction(AuthAction.didResendVerificationEmailAction({ result: true }))
    } catch (err) {
      logger.warn(err, 'Error resending verification email')
      dispatchAction(AuthAction.didResendVerificationEmailAction({ result: false }))
    } finally {
      dispatchAction(AuthAction.actionProcessing({ processing: false }))
    }
  },

  async forgotPassword(email: string) {
    dispatchAction(AuthAction.actionProcessing({ processing: true }))
    logger.info('forgotPassword event for email "${email}".')

    try {
      await API.instance.client.service('authManagement').create({
        action: 'sendResetPwd',
        value: { token: email, type: 'password' }
      })
      dispatchAction(AuthAction.didForgotPasswordAction({ result: true }))
    } catch (err) {
      logger.warn(err, 'Error sending forgot password email')
      dispatchAction(AuthAction.didForgotPasswordAction({ result: false }))
    } finally {
      dispatchAction(AuthAction.actionProcessing({ processing: false }))
    }
  },

  async resetPassword(token: string, password: string) {
    dispatchAction(AuthAction.actionProcessing({ processing: true }))
    try {
      await API.instance.client.service('authManagement').create({
        action: 'resetPwdLong',
        value: { token, password }
      })
      dispatchAction(AuthAction.didResetPasswordAction({ result: true }))
      window.location.href = '/'
    } catch (err) {
      dispatchAction(AuthAction.didResetPasswordAction({ result: false }))
      window.location.href = '/'
    } finally {
      dispatchAction(AuthAction.actionProcessing({ processing: false }))
    }
  },

  async createMagicLink(emailPhone: string, authState: AuthStrategies, linkType?: 'email' | 'sms') {
    dispatchAction(AuthAction.actionProcessing({ processing: true }))

    let type = 'email'
    let paramName = 'email'
    const enableEmailMagicLink = authState?.emailMagicLink
    const enableSmsMagicLink = authState?.smsMagicLink

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
          NotificationService.dispatchNotify(i18n.t('common:error.validation-error', { type: 'email address' }), {
            variant: 'error'
          })
          return
        }
        type = 'sms'
        paramName = 'mobile'
        emailPhone = '+1' + stripped
      } else if (validateEmail(emailPhone)) {
        if (!enableEmailMagicLink) {
          NotificationService.dispatchNotify(i18n.t('common:error.validation-error', { type: 'phone number' }), {
            variant: 'error'
          })
          return
        }
        type = 'email'
      } else {
        NotificationService.dispatchNotify(i18n.t('common:error.validation-error', { type: 'email or phone number' }), {
          variant: 'error'
        })
        return
      }
    }

    try {
      await API.instance.client.service('magic-link').create({ type, [paramName]: emailPhone })
      dispatchAction(AuthAction.didCreateMagicLinkAction({ result: true }))
      NotificationService.dispatchNotify(i18n.t('user:auth.magiklink.success-msg'), { variant: 'success' })
    } catch (err) {
      dispatchAction(AuthAction.didCreateMagicLinkAction({ result: false }))
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    } finally {
      dispatchAction(AuthAction.actionProcessing({ processing: false }))
    }
  },

  async addConnectionByPassword(form: EmailLoginForm, userId: string) {
    dispatchAction(AuthAction.actionProcessing({ processing: true }))

    try {
      const identityProvider = await API.instance.client.service('identity-provider').create({
        token: form.email,
        password: form.password,
        type: 'password',
        userId
      })
      return AuthService.loadUserData(identityProvider.userId)
    } catch (err) {
      logger.warn(err, 'Error adding connection by password')
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    } finally {
      dispatchAction(AuthAction.actionProcessing({ processing: false }))
    }
  },

  async addConnectionByEmail(email: string, userId: string) {
    dispatchAction(AuthAction.actionProcessing({ processing: true }))
    try {
      const identityProvider = (await API.instance.client.service('magic-link').create({
        email,
        type: 'email',
        userId
      })) as IdentityProvider
      if (identityProvider.userId) {
        NotificationService.dispatchNotify(i18n.t('user:auth.magiklink.email-sent-msg'), { variant: 'success' })
        return AuthService.loadUserData(identityProvider.userId)
      }
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    } finally {
      dispatchAction(AuthAction.actionProcessing({ processing: false }))
    }
  },

  async addConnectionBySms(phone: string, userId: string) {
    dispatchAction(AuthAction.actionProcessing({ processing: true }))

    let sendPhone = phone.replace(/-/g, '')
    if (sendPhone.length === 10) {
      sendPhone = '1' + sendPhone
    }

    try {
      const identityProvider = (await API.instance.client.service('magic-link').create({
        mobile: sendPhone,
        type: 'sms',
        userId
      })) as IdentityProvider
      if (identityProvider.userId) {
        NotificationService.dispatchNotify(i18n.t('user:auth.magiklink.sms-sent-msg'), { variant: 'error' })
        return AuthService.loadUserData(identityProvider.userId)
      }
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    } finally {
      dispatchAction(AuthAction.actionProcessing({ processing: false }))
    }
  },

  async addConnectionByOauth(
    oauth: 'facebook' | 'google' | 'github' | 'linkedin' | 'twitter' | 'discord',
    userId: string
  ) {
    window.open(`https://${globalThis.process.env['VITE_SERVER_HOST']}/auth/oauth/${oauth}?userId=${userId}`, '_blank')
  },

  async removeConnection(identityProviderId: number, userId: string) {
    dispatchAction(AuthAction.actionProcessing({ processing: true }))
    try {
      await API.instance.client.service('identity-provider').remove(identityProviderId)
      return AuthService.loadUserData(userId)
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    } finally {
      dispatchAction(AuthAction.actionProcessing({ processing: false }))
    }
  },

  refreshConnections(userId: string) {
    AuthService.loadUserData(userId)
  },

  async updateUserSettings(id: any, data: any) {
    const res = (await API.instance.client.service('user-settings').patch(id, data)) as UserSetting
    dispatchAction(AuthAction.updatedUserSettingsAction({ data: res }))
  },

  async removeUser(userId: string) {
    await API.instance.client.service('user').remove(userId)
    AuthService.logoutUser()
  },

  async updateApiKey() {
    const apiKey = (await API.instance.client.service('user-api-key').patch(null, {})) as UserApiKey
    dispatchAction(AuthAction.apiKeyUpdatedAction({ apiKey }))
  },

  async updateUsername(userId: string, name: string) {
    const { name: updatedName } = await API.instance.client.service('user').patch(userId, { name: name })
    NotificationService.dispatchNotify(i18n.t('user:usermenu.profile.update-msg'), { variant: 'success' })
    dispatchAction(AuthAction.usernameUpdatedAction({ name: updatedName }))
  },

  useAPIListeners: () => {
    useEffect(() => {
      const userPatchedListener = (params) => dispatchAction(AuthAction.userPatchedAction({ params }))
      const locationBanCreatedListener = async (params) => {
        const selfUser = accessAuthState().user
        const currentLocation = accessLocationState().currentLocation.location
        const locationBan = params.locationBan
        if (selfUser.id.value === locationBan.userId && currentLocation.id.value === locationBan.locationId) {
          // TODO: Decouple and reenable me!
          // endVideoChat({ leftParty: true });
          // leave(true);
          const userId = selfUser.id.value ?? ''
          const user = resolveUser(await API.instance.client.service('user').get(userId))
          dispatchAction(AuthAction.userUpdatedAction({ user }))
        }
      }

      API.instance.client.service('user').on('patched', userPatchedListener)
      API.instance.client.service('location-ban').on('created', locationBanCreatedListener)

      return () => {
        API.instance.client.service('user').off('patched', userPatchedListener)
        API.instance.client.service('location-ban').off('created', locationBanCreatedListener)
      }
    }, [])
  }
}

/**
 * @param vprResult {any} See `loginUserByXRWallet()`'s docstring.
 */
function parseUserWalletCredentials(vprResult: any) {
  console.log('PARSING:', vprResult)

  const {
    data: { presentation: vp }
  } = vprResult
  const credentials = Array.isArray(vp.verifiableCredential) ? vp.verifiableCredential : [vp.verifiableCredential]

  const { displayName, displayIcon } = parseLoginDisplayCredential(credentials)

  return {
    user: {
      id: vp.holder,
      displayName,
      icon: displayIcon
      // session // this will contain the access token and helper methods
    }
  }
}

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
