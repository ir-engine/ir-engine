import Immutable from 'immutable'
import { AnalyticsRetriveResponse } from './actions'
import { SETTING_ANALYIS_DISPLAY } from '../../../actions'

export const initialAnalyticAdminState = {
  Analytics: {
    analytics: [],
    updateNeeded: true
  }
}

const immutableState = Immutable.fromJS(initialAnalyticAdminState) as any

const settingAnalyticsReducer = (state = immutableState, action: any): any => {
  let result, updateMap
  switch (action.type) {
    case SETTING_ANALYIS_DISPLAY:
      result = (action as AnalyticsRetriveResponse).analytics

      updateMap = new Map(state.get('Analytics'))
      updateMap.set('analytics', result.data)
      updateMap.set('updateNeeded', false)
      return state.set('Analytics', updateMap)
  }
  return state
}

export default settingAnalyticsReducer
