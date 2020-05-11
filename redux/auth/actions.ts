import {
  LOGIN_USER_BY_GITHUB_ERROR,
  LOGIN_USER_BY_GITHUB_SUCCESS,

  LOGIN_USER_SUCCESS,
  LOGIN_USER_ERROR,

  LOGOUT_USER,
  REGISTER_USER_BY_EMAIL_ERROR,
  REGISTER_USER_BY_EMAIL_SUCCESS,
  DID_VERIFY_EMAIL,
  DID_RESEND_VERIFICATION_EMAIL,
  DID_FORGOT_PASSWORD,
  DID_RESET_PASSWORD,
  ACTION_PROCESSING,
  DID_CREATE_MAGICLINK,
  UPDATE_USER_SETTINGS,
  LOADED_USER_DATA
} from '../actions'
import { AuthUser } from '../../interfaces/AuthUser'
import { User } from '../../interfaces/User'
import { IdentityProvider } from '../../interfaces/IdentityProvider'

export interface AuthState {
  isLoggedIn: boolean
  isProcessing: boolean

  error: string

  authUser?: AuthUser
  user?: User
  identityProvider?: IdentityProvider
}

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

export interface AuthProcessingAction {
  type: string
  processing: boolean
}

export interface AddConnectionProcessingAction {
  type: string
  processing: boolean
  userId: string
}

export interface LoginResultAction {
  type: string
  authUser?: AuthUser
  message: string
}

export interface RegistrationResultAction {
  type: string
  identityProvider?: IdentityProvider
  message: string
}

export interface AuthResultAction {
  type: string
  result: boolean
}

export interface AddConnectionResultAction {
  type: string
  user?: any
  message?: string
}

export interface LoadDataResultAction {
  type: string
  user?: User
}

export type AuthAction =
  AuthProcessingAction
  | LoginResultAction
  | RegistrationResultAction
  | AuthResultAction
  | AddConnectionResultAction
  | AddConnectionProcessingAction
  | LoadDataResultAction

export const actionProcessing = (processing: boolean): AuthProcessingAction => {
  return {
    type: ACTION_PROCESSING,
    processing
  }
}

export const loginUserSuccess = (authUser: AuthUser): LoginResultAction => {
  return {
    type: LOGIN_USER_SUCCESS,
    authUser,
    message: ''
  }
}

export const loginUserError = (err: string): LoginResultAction => {
  return {
    type: LOGIN_USER_ERROR,
    message: err
  }
}

export const loginUserByGithubSuccess = (message: string): LoginResultAction => {
  return {
    type: LOGIN_USER_BY_GITHUB_SUCCESS,
    message
  }
}

export const loginUserByGithubError = (message: string): LoginResultAction => {
  return {
    type: LOGIN_USER_BY_GITHUB_ERROR,
    message
  }
}

export const didLogout = (): LoginResultAction => {
  return {
    type: LOGOUT_USER,
    message: ''
  }
}

export const registerUserByEmailSuccess = (identityProvider: IdentityProvider): RegistrationResultAction => {
  return {
    type: REGISTER_USER_BY_EMAIL_SUCCESS,
    identityProvider,
    message: ''
  }
}

export const registerUserByEmailError = (message: string): RegistrationResultAction => {
  return {
    type: REGISTER_USER_BY_EMAIL_ERROR,
    message: message
  }
}

export const didVerifyEmail = (result: boolean): AuthResultAction => {
  return {
    type: DID_VERIFY_EMAIL,
    result
  }
}

export const didResendVerificationEmail = (result: boolean): AuthResultAction => {
  return {
    type: DID_RESEND_VERIFICATION_EMAIL,
    result
  }
}

export const didForgotPassword = (result: boolean): AuthResultAction => {
  return {
    type: DID_FORGOT_PASSWORD,
    result
  }
}

export const didResetPassword = (result: boolean): AuthResultAction => {
  return {
    type: DID_RESET_PASSWORD,
    result
  }
}

export const didCreateMagicLink = (result: boolean): AuthResultAction => {
  return {
    type: DID_CREATE_MAGICLINK,
    result
  }
}

export const loadedUserData = (user: User): LoadDataResultAction => {
  return {
    type: LOADED_USER_DATA,
    user
  }
}
export const updateSettings = (message: any): RegistrationResultAction => {
  return {
    type: UPDATE_USER_SETTINGS,
    message
  }
}
