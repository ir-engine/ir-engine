import { Downgraded } from '@hookstate/core'

import { AuthUser, AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'
import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'
import { IdentityProvider } from '@xrengine/common/src/interfaces/IdentityProvider'
import { UserInterface, UserSeed, UserSetting } from '@xrengine/common/src/interfaces/User'
import { UserApiKey } from '@xrengine/common/src/interfaces/UserApiKey'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, getState } from '@xrengine/hyperflux'

import { accessStoredLocalState, StoredLocalAction } from '../../util/StoredLocalState'
import { userPatched } from '../functions/userPatched'
import { AuthState } from './AuthService'

export const avatarFetchedReceptor = (s: any, action: any) => {
  return s.avatarList.set(action.avatarList)
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
        identityProvider: stored.authUser?.identityProvider
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
    user: matches.object as Validator<unknown, UserInterface>
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
    user: matches.object as Validator<unknown, UserInterface>
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
