import Immutable from 'immutable'
import { ChargebeeRetriveResponse } from './actions'
import { CHARGEBEE_SETTING_DISPLAY } from '../../../actions'

export const initialChargebeeState = {
  Chargebee: {
    chargebee: [],
    updateNeeded: true
  }
}

const immutableState = Immutable.fromJS(initialChargebeeState) as any

const chargebeeSettingReducer = (state = immutableState, action: any): any => {
  let result, updateMap
  switch (action.type) {
    case CHARGEBEE_SETTING_DISPLAY:
      result = (action as ChargebeeRetriveResponse).chargebee

      updateMap = new Map(state.get('Chargebee'))
      updateMap.set('chargebee', result.data)
      updateMap.set('updateNeeded', false)
      return state.set('Chargebee', updateMap)
  }
  return state
}

export default chargebeeSettingReducer
