import Immutable from 'immutable'

import { AuthSettingFetchedAction } from './actions'
import { ADMIN_AUTH_SETTING_FETCHED, ADMIN_AUTH_SETTING_PATCHED } from '../../../actions'

export const initialAuthSettingAdminState = {
  authSettings: {
    authSettings: [],
    skip: 0,
    limit: 100,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true
  }
}

const immutableState = Immutable.fromJS(initialAuthSettingAdminState) as any

const adminAuthSettingReducer = (state = immutableState, action: any): any => {
  let result: any, updateMap: any
  switch (action.type) {
    case ADMIN_AUTH_SETTING_FETCHED:
      result = (action as AuthSettingFetchedAction).list
      updateMap = new Map(state.get('authSettings'))
      updateMap.set('authSettings', result.data)
      updateMap.set('skip', (result as any).skip)
      updateMap.set('limit', (result as any).limit)
      updateMap.set('total', (result as any).total)
      updateMap.set('updateNeeded', false)
      return state.set('authSettings', updateMap)

    case ADMIN_AUTH_SETTING_PATCHED:
      updateMap = new Map(state.get('authSettings'))
      updateMap.set('updateNeeded', true)
      return state.set('authSettings', updateMap)
  }

  return state
}

export default adminAuthSettingReducer
