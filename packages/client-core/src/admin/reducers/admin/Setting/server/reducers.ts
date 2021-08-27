import Immutable from 'immutable'
import { ServerRetrieveResponse } from './actions'
import { SETTING_SERVER_DISPLAY } from '../../../actions'

export const initialServerState = {
  Server: {
    server: [],
    updateNeeded: true
  }
}

const immutableState = Immutable.fromJS(initialServerState) as any

const settingServerReducer = (state = immutableState, action: any): any => {
  let result, updateMap

  switch (action.type) {
    case SETTING_SERVER_DISPLAY:
      result = (action as ServerRetrieveResponse).serverInfo
      updateMap = new Map(state.get('Server'))
      updateMap.set('server', result.data)
      updateMap.set('updateNeeded', false)
      return state.set('Server', updateMap)
  }

  return state
}

export default settingServerReducer
