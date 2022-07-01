import { Paginated } from '@feathersjs/feathers'
import { Downgraded } from '@speigg/hookstate'
// TODO: Decouple this
// import { endVideoChat, leave } from '@xrengine/engine/src/networking/functions/SocketWebRTCClientFunctions';
import axios from 'axios'
import i18n from 'i18next'
import _ from 'lodash'
import querystring from 'querystring'
import { useEffect } from 'react'
import { v1 } from 'uuid'

import { validateEmail, validatePhoneNumber } from '@xrengine/common/src/config'
import { AuthUser, AuthUserSeed, resolveAuthUser } from '@xrengine/common/src/interfaces/AuthUser'
import { AvatarInterface, AvatarProps } from '@xrengine/common/src/interfaces/AvatarInterface'
import { IdentityProvider, IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { resolveUser, resolveWalletUser, User, UserSeed, UserSetting } from '@xrengine/common/src/interfaces/User'
import { UserApiKey } from '@xrengine/common/src/interfaces/UserApiKey'
import { UserAvatar } from '@xrengine/common/src/interfaces/UserAvatar'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { WorldNetworkAction } from '@xrengine/engine/src/networking/functions/WorldNetworkAction'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'
import { accessLocationState } from '../../social/services/LocationService'
import { accessPartyState } from '../../social/services/PartyService'
import { serverHost } from '../../util/config'
import { accessStoredLocalState, StoredLocalAction } from '../../util/StoredLocalState'
import { uploadToFeathersService } from '../../util/upload'
import { userPatched } from '../functions/userPatched'

const TIMEOUT_INTERVAL = 50 //ms per interval of waiting for authToken to be updated

type AuthStrategies = {
  jwt: Boolean
  local: Boolean
  facebook: Boolean
  github: Boolean
  google: Boolean
  linkedin: Boolean
  twitter: Boolean
  smsMagicLink: Boolean
  emailMagicLink: Boolean
}

//State
const AuthState = defineState({
  name: 'AuthState',
  initial: () => ({
    isLoggedIn: false,
    isProcessing: false,
    error: '',
    authUser: AuthUserSeed,
    user: UserSeed,
    identityProvider: IdentityProviderSeed,
    avatarList: [] as Array<UserAvatar>
  }),
  onCreate: (store, s) => {
    s.attach(() => ({
      id: Symbol('AuthPersist'),
      init: () => ({
        onSet(arg) {
          const state = s.attach(Downgraded).value
          if (state.isLoggedIn)
            dispatchAction(
              StoredLocalAction.storedLocal({
                newState: {
                  authUser: state.authUser
                }
              }),
              undefined,
              store
            )
        }
      })
    }))
  }
})

export const avatarFetchedReceptor = (s: any, action: any) => {
  const resources = action.avatarList
  const avatarData = {}
  for (let resource of resources) {
    const r = avatarData[(resource as any).name] || {}
    if (!r) {
      console.warn(i18n.t('user:avatar.warning-msg'))
      return
    }
    r[(resource as any).staticResourceType] = resource
    avatarData[(resource as any).name] = r
  }

  return s.avatarList.set(Object.keys(avatarData).map((key) => avatarData[key]))
}

export const AuthServiceReceptor = (action) => {
  getState(AuthState).batch((s) => {
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
        return s.merge({ identityProvider: action.identityProvider })
      })
      .when(AuthAction.registerUserByEmailErrorAction.matches, (action) => {
        return s
      })
      .when(AuthAction.didLogoutAction.matches, () => {
        return s.merge({ isLoggedIn: false, user: UserSeed, authUser: AuthUserSeed })
      })
      .when(AuthAction.didVerifyEmailAction.matches, (action) => {
        return s.identityProvider.merge({ isVerified: action.result })
      })
      .when(StoredLocalAction.restoreLocalData.matches, () => {
        const stored = accessStoredLocalState().attach(Downgraded).value
        return s.merge({
          authUser: stored.authUser,
          identityProvider: stored.authUser.identityProvider
        })
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
      .when(AuthAction.updateAvatarListAction.matches, (action) => {
        return avatarFetchedReceptor(s, action)
      })
  })
}

export const accessAuthState = () => getState(AuthState)
export const useAuthState = () => useState(accessAuthState())

//Service
export const AuthService = {
  doLoginAuto: async (forceClientAuthReset?: boolean) => {
    try {
      const authData = accessStoredLocalState().attach(Downgraded).value
      let accessToken =
        forceClientAuthReset !== true && authData && authData.authUser ? authData.authUser.accessToken : undefined

      if (forceClientAuthReset === true) await API.instance.client.authentication.reset()
      if (accessToken == null || accessToken.length === 0) {
        const newProvider = await API.instance.client.service('identity-provider').create({
          type: 'guest',
          token: v1()
        })
        accessToken = newProvider.accessToken
      }

      await API.instance.client.authentication.setAccessToken(accessToken as string)
      let res
      try {
        res = await API.instance.client.reAuthenticate()
      } catch (err) {
        if (err.className === 'not-found' || (err.className === 'not-authenticated' && err.message === 'jwt expired')) {
          await dispatchAction(AuthAction.didLogoutAction())
          await API.instance.client.authentication.reset()
          const newProvider = await API.instance.client.service('identity-provider').create({
            type: 'guest',
            token: v1()
          })
          accessToken = newProvider.accessToken
          await API.instance.client.authentication.setAccessToken(accessToken as string)
          res = await API.instance.client.reAuthenticate()
        } else {
          throw err
        }
      }
      if (res) {
        if (res['identity-provider']?.id == null) {
          await dispatchAction(AuthAction.didLogoutAction())
          await API.instance.client.authentication.reset()
          const newProvider = await API.instance.client.service('identity-provider').create({
            type: 'guest',
            token: v1()
          })
          accessToken = newProvider.accessToken
          await API.instance.client.authentication.setAccessToken(accessToken as string)
          res = await API.instance.client.reAuthenticate()
        }
        const authUser = resolveAuthUser(res)

        // Should dispatch
        dispatchAction(AuthAction.loginUserSuccessAction({ authUser, message: '' }))

        await AuthService.loadUserData(authUser.identityProvider.userId)
      } else {
        console.log('****************')
      }
    } catch (err) {
      console.log('error on resolving auth user in doLoginAuto, logging out')
      console.error(err)
      dispatchAction(AuthAction.didLogoutAction())

      // if (window.location.pathname !== '/') {
      //   window.location.href = '/';
      // }
    }
  },
  loadUserData: (userId: string): any => {
    return API.instance.client
      .service('user')
      .get(userId)
      .then((res: any) => {
        if (res.user_setting == null) {
          return API.instance.client
            .service('user-settings')
            .find({
              query: {
                userId: userId
              }
            })
            .then((settingsRes: Paginated<UserSetting>) => {
              if (settingsRes.total === 0) {
                return API.instance.client
                  .service('user-settings')
                  .create({
                    userId: userId
                  })
                  .then((newSettings) => {
                    res.user_setting = newSettings

                    return Promise.resolve(res)
                  })
              }
              res.user_setting = settingsRes.data[0]
              return Promise.resolve(res)
            })
        }
        return Promise.resolve(res)
      })
      .then((res: any) => {
        const user = resolveUser(res)
        dispatchAction(AuthAction.loadedUserDataAction({ user }))
      })
      .catch((err: any) => {
        NotificationService.dispatchNotify(i18n.t('common:error.loading-error'), { variant: 'error' })
      })
  },
  loginUserByPassword: async (form: EmailLoginForm) => {
    // check email validation.
    if (!validateEmail(form.email)) {
      NotificationService.dispatchNotify(i18n.t('common:error.validation-error', { type: 'email address' }), {
        variant: 'error'
      })

      return
    }

    dispatchAction(AuthAction.actionProcessing({ processing: true }))
    API.instance.client
      .authenticate({
        strategy: 'local',
        email: form.email,
        password: form.password
      })
      .then((res: any) => {
        const authUser = resolveAuthUser(res)

        if (!authUser.identityProvider.isVerified) {
          API.instance.client.logout()

          dispatchAction(
            AuthAction.registerUserByEmailSuccessAction({ identityProvider: authUser.identityProvider, message: '' })
          )
          window.location.href = '/auth/confirm'
          return
        }

        dispatchAction(AuthAction.loginUserSuccessAction({ authUser: authUser, message: '' }))
        AuthService.loadUserData(authUser.identityProvider.userId).then(() => (window.location.href = '/'))
      })
      .catch((err: any) => {
        dispatchAction(AuthAction.loginUserErrorAction({ message: i18n.t('common:error.login-error') }))
        NotificationService.dispatchNotify(err.message, { variant: 'error' })
      })
      .finally(() => dispatchAction(AuthAction.actionProcessing({ processing: false })))
  },
  loginUserByXRWallet: async (wallet: any) => {
    try {
      dispatchAction(AuthAction.actionProcessing({ processing: true }))

      const credentials: any = parseUserWalletCredentials(wallet)
      console.log(credentials)

      const walletUser = resolveWalletUser(credentials)

      //TODO: This is temp until we move completely to XR wallet
      const oldId = accessAuthState().user.id.value
      walletUser.id = oldId

      // loadXRAvatarForUpdatedUser(walletUser) // TODO
      dispatchAction(AuthAction.loadedUserDataAction({ user: walletUser }))
    } catch (err) {
      dispatchAction(AuthAction.loginUserErrorAction({ message: i18n.t('common:error.login-error') }))
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    } finally {
      dispatchAction(AuthAction.actionProcessing({ processing: false }))
    }
  },
  loginUserByOAuth: async (service: string, location: any) => {
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
  removeUserOAuth: async (service: string) => {
    const ipResult = (await API.instance.client.service('identity-provider').find()) as any
    const ipToRemove = ipResult.data.find((ip) => ip.type === service)
    if (ipToRemove) {
      if (ipResult.total === 1) {
        console.log('show last warning modal')
        await API.instance.client.service('user').remove(ipToRemove.userId)
        await AuthService.logoutUser()
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
  loginUserByJwt: async (accessToken: string, redirectSuccess: string, redirectError: string) => {
    try {
      dispatchAction(AuthAction.actionProcessing({ processing: true }))
      await API.instance.client.authentication.setAccessToken(accessToken as string)
      const res = await API.instance.client.authenticate({
        strategy: 'jwt',
        accessToken
      })

      const authUser = resolveAuthUser(res)

      dispatchAction(AuthAction.loginUserSuccessAction({ authUser: authUser, message: '' }))
      await AuthService.loadUserData(authUser.identityProvider.userId)
      dispatchAction(AuthAction.actionProcessing({ processing: false }))
      let timeoutTimer = 0
      // The new JWT does not always get stored in localStorage successfully by this point, and if the user is
      // redirected to redirectSuccess now, they will still have an old JWT, which can cause them to not be logged
      // in properly. This interval waits to make sure the token has been updated before redirecting
      const waitForTokenStored = setInterval(() => {
        timeoutTimer += TIMEOUT_INTERVAL
        const authData = accessStoredLocalState().attach(Downgraded).value
        let storedToken = authData && authData.authUser ? authData.authUser.accessToken : undefined
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
      dispatchAction(AuthAction.actionProcessing({ processing: false }))
    }
  },
  loginUserMagicLink: async (token, redirectSuccess, redirectError) => {
    try {
      const res = await API.instance.client.service('login').get(token)
      await AuthService.loginUserByJwt(res.token, '/', '/')
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    } finally {
      window.location.href = redirectSuccess
    }
  },
  logoutUser: async () => {
    dispatchAction(AuthAction.actionProcessing({ processing: true }))
    API.instance.client
      .logout()
      .then(() => dispatchAction(AuthAction.didLogoutAction()))
      .catch(() => dispatchAction(AuthAction.didLogoutAction()))
      .finally(() => {
        dispatchAction(AuthAction.actionProcessing({ processing: false }))
        AuthService.doLoginAuto(true)
      })
  },
  registerUserByEmail: (form: EmailRegistrationForm) => {
    dispatchAction(AuthAction.actionProcessing({ processing: true }))
    API.instance.client
      .service('identity-provider')
      .create({
        token: form.email,
        password: form.password,
        type: 'password'
      })
      .then((identityProvider: any) => {
        console.log('3 ', identityProvider)
        dispatchAction(AuthAction.registerUserByEmailSuccessAction({ identityProvider: identityProvider, message: '' }))
        window.location.href = '/auth/confirm'
      })
      .catch((err: any) => {
        console.log('error', err)
        dispatchAction(AuthAction.registerUserByEmailErrorAction({ message: err.message }))
        NotificationService.dispatchNotify(err.message, { variant: 'error' })
      })
      .finally(() => {
        // console.log('4 finally', dispatch)
        dispatchAction(AuthAction.actionProcessing({ processing: false }))
      })
  },
  verifyEmail: async (token: string) => {
    dispatchAction(AuthAction.actionProcessing({ processing: true }))

    API.instance.client
      .service('authManagement')
      .create({
        action: 'verifySignupLong',
        value: token
      })
      .then((res: any) => {
        dispatchAction(AuthAction.didVerifyEmailAction({ result: true }))
        AuthService.loginUserByJwt(res.accessToken, '/', '/')
      })
      .catch((err: any) => {
        dispatchAction(AuthAction.didVerifyEmailAction({ result: false }))
        NotificationService.dispatchNotify(err.message, { variant: 'error' })
      })
      .finally(() => dispatchAction(AuthAction.actionProcessing({ processing: false })))
  },
  resendVerificationEmail: async (email: string) => {
    dispatchAction(AuthAction.actionProcessing({ processing: true }))

    API.instance.client
      .service('authManagement')
      .create({
        action: 'resendVerifySignup',
        value: {
          token: email,
          type: 'password'
        }
      })
      .then(() => dispatchAction(AuthAction.didResendVerificationEmailAction({ result: true })))
      .catch(() => dispatchAction(AuthAction.didResendVerificationEmailAction({ result: false })))
      .finally(() => dispatchAction(AuthAction.actionProcessing({ processing: false })))
  },
  forgotPassword: async (email: string) => {
    dispatchAction(AuthAction.actionProcessing({ processing: true }))
    console.log('forgotPassword', email)
    API.instance.client
      .service('authManagement')
      .create({
        action: 'sendResetPwd',
        value: {
          token: email,
          type: 'password'
        }
      })
      .then(() => dispatchAction(AuthAction.didForgotPasswordAction({ result: true })))
      .catch(() => dispatchAction(AuthAction.didForgotPasswordAction({ result: false })))
      .finally(() => dispatchAction(AuthAction.actionProcessing({ processing: false })))
  },
  resetPassword: async (token: string, password: string) => {
    dispatchAction(AuthAction.actionProcessing({ processing: true }))

    API.instance.client
      .service('authManagement')
      .create({
        action: 'resetPwdLong',
        value: { token, password }
      })
      .then((res: any) => {
        console.log(res)
        dispatchAction(AuthAction.didResetPasswordAction({ result: true }))
        window.location.href = '/'
      })
      .catch((err: any) => {
        dispatchAction(AuthAction.didResetPasswordAction({ result: false }))
        window.location.href = '/'
      })
      .finally(() => dispatchAction(AuthAction.actionProcessing({ processing: false })))
  },
  createMagicLink: async (emailPhone: string, authState: AuthStrategies, linkType?: 'email' | 'sms') => {
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

    API.instance.client
      .service('magic-link')
      .create({
        type,
        [paramName]: emailPhone
      })
      .then((res: any) => {
        console.log(res)
        dispatchAction(AuthAction.didCreateMagicLinkAction({ result: true }))
        NotificationService.dispatchNotify(i18n.t('user:auth.magiklink.success-msg'), { variant: 'success' })
      })
      .catch((err: any) => {
        dispatchAction(AuthAction.didCreateMagicLinkAction({ result: false }))
        NotificationService.dispatchNotify(err.message, { variant: 'error' })
      })
      .finally(() => dispatchAction(AuthAction.actionProcessing({ processing: false })))
  },
  addConnectionByPassword: async (form: EmailLoginForm, userId: string) => {
    dispatchAction(AuthAction.actionProcessing({ processing: true }))

    API.instance.client
      .service('identity-provider')
      .create({
        token: form.email,
        password: form.password,
        type: 'password',
        userId
      })
      .then((res: any) => {
        const identityProvider = res as IdentityProvider
        return AuthService.loadUserData(identityProvider.userId)
      })
      .catch((err: any) => {
        NotificationService.dispatchNotify(err.message, { variant: 'error' })
      })
      .finally(() => dispatchAction(AuthAction.actionProcessing({ processing: false })))
  },
  addConnectionByEmail: async (email: string, userId: string) => {
    dispatchAction(AuthAction.actionProcessing({ processing: true }))
    API.instance.client
      .service('magic-link')
      .create({
        email,
        type: 'email',
        userId
      })
      .then((res: any) => {
        const identityProvider = res as IdentityProvider
        if (identityProvider.userId != null) {
          NotificationService.dispatchNotify(i18n.t('user:auth.magiklink.email-sent-msg'), { variant: 'success' })
          return AuthService.loadUserData(identityProvider.userId)
        }
      })
      .catch((err: any) => {
        NotificationService.dispatchNotify(err.message, { variant: 'error' })
      })
      .finally(() => dispatchAction(AuthAction.actionProcessing({ processing: false })))
  },
  addConnectionBySms: async (phone: string, userId: string) => {
    dispatchAction(AuthAction.actionProcessing({ processing: true }))

    let sendPhone = phone.replace(/-/g, '')
    if (sendPhone.length === 10) {
      sendPhone = '1' + sendPhone
    }

    API.instance.client
      .service('magic-link')
      .create({
        mobile: sendPhone,
        type: 'sms',
        userId
      })
      .then((res: any) => {
        const identityProvider = res as IdentityProvider
        if (identityProvider.userId != null) {
          NotificationService.dispatchNotify(i18n.t('user:auth.magiklink.sms-sent-msg'), { variant: 'error' })
          return AuthService.loadUserData(identityProvider.userId)
        }
      })
      .catch((err: any) => {
        NotificationService.dispatchNotify(err.message, { variant: 'error' })
      })
      .finally(() => dispatchAction(AuthAction.actionProcessing({ processing: false })))
  },
  addConnectionByOauth: async (
    oauth: 'facebook' | 'google' | 'github' | 'linkedin' | 'twitter' | 'discord',
    userId: string
  ) => {
    window.open(`https://${globalThis.process.env['VITE_SERVER_HOST']}/auth/oauth/${oauth}?userId=${userId}`, '_blank')
  },
  removeConnection: async (identityProviderId: number, userId: string) => {
    dispatchAction(AuthAction.actionProcessing({ processing: true }))

    API.instance.client
      .service('identity-provider')
      .remove(identityProviderId)
      .then(() => {
        return AuthService.loadUserData(userId)
      })
      .catch((err: any) => {
        NotificationService.dispatchNotify(err.message, { variant: 'error' })
      })
      .finally(() => dispatchAction(AuthAction.actionProcessing({ processing: false })))
  },
  refreshConnections: (userId: string) => {
    AuthService.loadUserData(userId)
  },
  updateUserSettings: async (id: any, data: any) => {
    const res = (await API.instance.client.service('user-settings').patch(id, data)) as UserSetting
    dispatchAction(AuthAction.updatedUserSettingsAction({ data: res }))
  },
  uploadAvatar: async (data: any) => {
    const token = accessAuthState().authUser.accessToken.value
    const selfUser = accessAuthState().user
    const res = await axios.post(`https://${globalThis.process.env['VITE_SERVER_HOST']}/upload`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + token
      }
    })
    const userId = selfUser.id.value ?? null
    await API.instance.client.service('user').patch(userId, {
      name: selfUser.name.value
    })
    const result = res.data
    NotificationService.dispatchNotify('Avatar updated', { variant: 'success' })
    dispatchAction(AuthAction.avatarUpdatedAction({ url: result.url }))
  },
  uploadAvatarModel: async (avatar: Blob, thumbnail: Blob, avatarName: string, isPublicAvatar?: boolean) => {
    await uploadToFeathersService('upload-asset', [avatar, thumbnail], {
      type: 'user-avatar-upload',
      args: {
        avatarName,
        isPublicAvatar: !!isPublicAvatar
      }
    })
    const avatarDetail = (await API.instance.client.service('avatar').get(avatarName)) as AvatarProps
    if (!isPublicAvatar) {
      const selfUser = accessAuthState().user
      const userId = selfUser.id.value!
      AuthService.updateUserAvatarId(userId, avatarName, avatarDetail.avatarURL, avatarDetail.thumbnailURL!)
    }
  },
  removeAvatar: async (keys: string) => {
    await API.instance.client
      .service('avatar')
      .remove('', {
        query: { keys }
      })
      .then((_) => {
        NotificationService.dispatchNotify(i18n.t('user:avatar.remove-success-msg'), { variant: 'success' })
        AuthService.fetchAvatarList()
      })
  },
  fetchAvatarList: async () => {
    const selfUser = accessAuthState().user

    const result = await API.instance.client.service('static-resource').find({
      query: {
        $select: ['id', 'key', 'name', 'url', 'staticResourceType', 'userId'],
        staticResourceType: {
          $in: ['avatar', 'user-thumbnail']
        },
        $or: [{ userId: selfUser.id.value }, { userId: null }],
        $limit: 1000
      }
    })
    dispatchAction(AuthAction.updateAvatarListAction({ avatarList: result.data }))
  },
  updateUsername: async (userId: string, name: string) => {
    API.instance.client
      .service('user')
      .patch(userId, {
        name: name
      })
      .then((res: any) => {
        NotificationService.dispatchNotify(i18n.t('user:usermenu.profile.update-msg'), { variant: 'success' })
        dispatchAction(AuthAction.usernameUpdatedAction({ name: res.name }))
      })
  },
  updateUserAvatarId: async (userId: string, avatarId: string, avatarURL: string, thumbnailURL: string) => {
    API.instance.client
      .service('user')
      .patch(userId, {
        avatarId: avatarId
      })
      .then((res: any) => {
        // dispatchAlertSuccess(dispatch, 'User Avatar updated');
        dispatchAction(AuthAction.userAvatarIdUpdatedAction({ avatarId: res.avatarId }))
        dispatchAction(
          WorldNetworkAction.avatarDetails({
            avatarDetail: {
              avatarURL,
              thumbnailURL
            }
          }),
          Engine.instance.currentWorld.worldNetwork.hostId
        )
      })
  },
  removeUser: async (userId: string) => {
    await API.instance.client.service('user').remove(userId)
    await API.instance.client.service('identity-provider').remove(null, {
      query: {
        userId: userId
      }
    })
    AuthService.logoutUser()
  },

  updateApiKey: async () => {
    const apiKey = (await API.instance.client.service('user-api-key').patch(null, {})) as UserApiKey
    dispatchAction(AuthAction.apiKeyUpdatedAction({ apiKey }))
  },
  useAPIListeners: () => {
    useEffect(() => {
      const userPatchedListener = (params) => dispatchAction(AuthAction.userPatchedAction({ params }))
      const locationBanCreatedListener = async (params) => {
        const selfUser = accessAuthState().user
        const party = accessPartyState().party.value
        const selfPartyUser =
          party && party.partyUsers
            ? party.partyUsers.find((partyUser) => partyUser.id === selfUser.id.value)
            : ({} as any)
        const currentLocation = accessLocationState().currentLocation.location
        const locationBan = params.locationBan
        if (selfUser.id.value === locationBan.userId && currentLocation.id.value === locationBan.locationId) {
          // TODO: Decouple and reenable me!
          // endVideoChat({ leftParty: true });
          // leave(true);
          if (selfPartyUser != undefined && selfPartyUser?.id != null) {
            await API.instance.client.service('party-user').remove(selfPartyUser.id)
          }
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

const parseUserWalletCredentials = (wallet) => {
  return {
    user: {
      id: 'did:web:example.com',
      displayName: 'alice',
      icon: 'https://material-ui.com/static/images/avatar/1.jpg'
      // session // this will contain the access token and helper methods
    }
  }
}

// Action
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

export class AuthAction {
  static actionProcessing = defineAction({
    type: 'ACTION_PROCESSING' as const,
    processing: matches.boolean
  })

  static loginUserSuccessAction = defineAction({
    type: 'LOGIN_USER_SUCCESS' as const,
    authUser: matches.object as Validator<unknown, AuthUser>,
    message: matches.string
  })

  static loginUserErrorAction = defineAction({
    type: 'LOGIN_USER_ERROR' as const,
    message: matches.string
  })

  static loginUserByGithubSuccessAction = defineAction({
    type: 'LOGIN_USER_BY_GITHUB_SUCCESS' as const,
    message: matches.string
  })

  static loginUserByGithubErrorAction = defineAction({
    type: 'LOGIN_USER_BY_GITHUB_ERROR' as const,
    message: matches.string
  })

  static loginUserByLinkedinSuccessAction = defineAction({
    type: 'LOGIN_USER_BY_LINKEDIN_SUCCESS' as const,
    message: matches.string
  })

  static loginUserByLinkedinErrorAction = defineAction({
    type: 'LOGIN_USER_BY_LINKEDIN_ERROR' as const,
    message: matches.string
  })

  static didLogoutAction = defineAction({
    type: 'LOGOUT_USER' as const
  })

  static registerUserByEmailSuccessAction = defineAction({
    type: 'REGISTER_USER_BY_EMAIL_SUCCESS' as const,
    identityProvider: matches.object as Validator<unknown, IdentityProvider>,
    message: matches.string
  })

  static registerUserByEmailErrorAction = defineAction({
    type: 'REGISTER_USER_BY_EMAIL_ERROR' as const,
    message: matches.string
  })

  static didVerifyEmailAction = defineAction({
    type: 'DID_VERIFY_EMAIL' as const,
    result: matches.boolean
  })

  static didResendVerificationEmailAction = defineAction({
    type: 'DID_RESEND_VERIFICATION_EMAIL' as const,
    result: matches.boolean
  })

  static didForgotPasswordAction = defineAction({
    type: 'DID_FORGOT_PASSWORD' as const,
    result: matches.boolean
  })

  static didResetPasswordAction = defineAction({
    type: 'DID_RESET_PASSWORD' as const,
    result: matches.boolean
  })

  static didCreateMagicLinkAction = defineAction({
    type: 'DID_CREATE_MAGICLINK' as const,
    result: matches.boolean
  })

  static loadedUserDataAction = defineAction({
    type: 'LOADED_USER_DATA' as const,
    user: matches.object as Validator<unknown, User>
  })

  static updatedUserSettingsAction = defineAction({
    type: 'UPDATE_USER_SETTINGS' as const,
    data: matches.object as Validator<unknown, UserSetting>
  })

  static avatarUpdatedAction = defineAction({
    type: 'AVATAR_UPDATED' as const,
    url: matches.any
  })

  static usernameUpdatedAction = defineAction({
    type: 'USERNAME_UPDATED' as const,
    name: matches.string
  })

  static userAvatarIdUpdatedAction = defineAction({
    type: 'USERAVATARID_UPDATED' as const,
    avatarId: matches.string
  })

  static userPatchedAction = defineAction({
    type: 'USER_PATCHED' as const,
    params: matches.any
  })

  static userUpdatedAction = defineAction({
    type: 'USER_UPDATED' as const,
    user: matches.object as Validator<unknown, User>
  })

  static updateAvatarListAction = defineAction({
    type: 'AVATAR_FETCHED' as const,
    avatarList: matches.array as Validator<unknown, AvatarInterface[]>
  })

  static apiKeyUpdatedAction = defineAction({
    type: 'USER_API_KEY_UPDATED' as const,
    apiKey: matches.object as Validator<unknown, UserApiKey>
  })
}
