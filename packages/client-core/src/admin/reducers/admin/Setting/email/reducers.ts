import Immutable from 'immutable'
import { EmailRetrieveResponse } from './actions'
import { EMAIL_SETTING_DISPLAY, EMAIL_SETTING_UPDATE } from '../../../actions'
export const initialEmailState = {
  Email: {
    email: [],
    updateNeeded: true
  }
}

const immutableState = Immutable.fromJS(initialEmailState) as any

const emailSettingReducer = (state = immutableState, action: any): any => {
  let result, updateMap
  switch (action.type) {
    case EMAIL_SETTING_DISPLAY:
      result = (action as EmailRetrieveResponse).email
      updateMap = new Map(state.get('Email'))
      updateMap.set('email', result.data)
      updateMap.set('updateNeeded', false)
      return state.set('Email', updateMap)
  }
  return state
}

export default emailSettingReducer
