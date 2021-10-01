import Immutable from 'immutable'

import { AwsSettingFetchedAction } from './actions'
import { ADMIN_AWS_SETTING_FETCHED } from '../../../actions'

export const initialAwsSettingAdminState = {
  awsSettings: {
    awsSettings: [],
    skip: 0,
    limit: 100,
    total: 0,
    updateNeeded: true
  }
}

const immutableState = Immutable.fromJS(initialAwsSettingAdminState) as any

const adminAwsSettingReducer = (state = immutableState, action: any): any => {
  let result: any, updateMap: any
  switch (action.type) {
    case ADMIN_AWS_SETTING_FETCHED:
      result = (action as AwsSettingFetchedAction).list
      updateMap = new Map(state.get('awsSettings'))
      updateMap.set('awsSettings', result.data)
      updateMap.set('updateNeeded', false)

      return state.set('awsSettings', updateMap)
  }

  return state
}

export default adminAwsSettingReducer
