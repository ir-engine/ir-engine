import Immutable from 'immutable'
import {
  VideoCreatedAction
} from './actions'

import {
  VIDEO_CREATED
} from '../actions'
import { UserSeed } from '../../interfaces/User'
import { IdentityProviderSeed } from '../../interfaces/IdentityProvider'
import { AuthUserSeed } from '../../interfaces/AuthUser'

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
    case VIDEO_CREATED:
      return state
        .set('data', (action as VideoCreatedAction).data)
  }

  return state
}

export default authReducer
