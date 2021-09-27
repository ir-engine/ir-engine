import Immutable from 'immutable'
import {} from './actions'

import {} from '../actions'

export const initialCreatorState = {
  registration: {}
}

const immutableState = Immutable.fromJS(initialCreatorState)

interface interfaceRegistration {
  type: string
  registration: any
  payload?: any
}

const registrationReducer = (state: any = immutableState, action: any): any => {
  switch (action.type) {
    default:
      return state
  }
}

export default registrationReducer
