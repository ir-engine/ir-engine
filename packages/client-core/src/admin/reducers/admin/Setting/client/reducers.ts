import Immutable from 'immutable'
import { ClientRetrieveResponse } from './actions'
import { CLIENT_SETTING_DISPLAY } from '../../../actions'

export const initialClientState = {
  Client: {
    client: [],
    updateNeeded: true
  }
}

const immutableState = Immutable.fromJS(initialClientState) as any

const clientSettingReducer = (state = immutableState, action: any): any => {
  let result, updateMap
  switch (action.type) {
    case CLIENT_SETTING_DISPLAY:
      result = (action as ClientRetrieveResponse).client
      updateMap = new Map(state.get('Client'))
      updateMap.set('client', result.data)
      updateMap.set('updateNeeded', false)
      return state.set('Client', updateMap)
  }
  return state
}

export default clientSettingReducer
