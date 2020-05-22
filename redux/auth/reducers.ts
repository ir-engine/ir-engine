import Immutable from 'immutable'
import {
  AuthProcessingAction,
  LoginResultAction,
  AuthResultAction,
  RegistrationResultAction,
  LoadDataResultAction
} from './actions'

import {
  LOGIN_USER_BY_GITHUB_SUCCESS,
  LOGIN_USER_BY_GITHUB_ERROR,
  LOGIN_USER_SUCCESS,
  LOGIN_USER_ERROR,
  LOGOUT_USER,
  REGISTER_USER_BY_EMAIL_SUCCESS,
  ACTION_PROCESSING,
  DID_VERIFY_EMAIL,
  REGISTER_USER_BY_EMAIL_ERROR,
  RESTORE,
  LOADED_USER_DATA
} from '../actions'
import { getStoredState } from '../persisted.store'
import { UserSeed } from '../../interfaces/User'
import { IdentityProviderSeed } from '../../interfaces/IdentityProvider'
import { AuthUserSeed } from '../../interfaces/AuthUser'
// import { getStoredState } from '../persisted.store'

export const initialState = {
  isLoggedIn: false,
  isProcessing: false,
  error: '',
  authUser: AuthUserSeed,
  user: UserSeed,
  identityProvider: IdentityProviderSeed
}

const immutableState = Immutable.fromJS(initialState)

const authReducer = (state = immutableState, action: any): any => {
  switch (action.type) {
    case ACTION_PROCESSING:
      return state
        .set('isProcessing', (action as AuthProcessingAction).processing)
        .set('error', '')
    case LOGIN_USER_SUCCESS:
      console.log('*****************Logined****************')
      return state
        .set('isLoggedIn', true)
        .set('authUser', (action as LoginResultAction).authUser)
    case LOGIN_USER_ERROR:
      return state
        .set('error', (action as LoginResultAction).message)
    case LOGIN_USER_BY_GITHUB_SUCCESS:
      break
    case LOGIN_USER_BY_GITHUB_ERROR:
      return state
        .set('error', (action as LoginResultAction).message)
    case REGISTER_USER_BY_EMAIL_SUCCESS:
      return state
        .set('identityProvider', (action as RegistrationResultAction).identityProvider)
    case REGISTER_USER_BY_EMAIL_ERROR:
      break
    case LOGOUT_USER:
      return state
        .set('isLoggedIn', false)
        .set('user', undefined)
        .set('authUser', undefined)
    case DID_VERIFY_EMAIL:
      return state
        .set('isVerified', (action as AuthResultAction).result)

    case LOADED_USER_DATA: {
      const user = (action as LoadDataResultAction).user

      return state
        .set('user', user)
    }
    case RESTORE: {
      const stored = getStoredState('auth')

      if (stored) {
        return state
          .set('isLoggedIn', stored.isLoggedIn)
          .set('authUser', stored.authUser)
          .set('identityProvider', stored.identityProvider)
      }
      return state
    }
  }

  return state
}

export default authReducer
