import Immutable from 'immutable'

import { RedisSettingRetrieved } from './actions'
import { ADMIN_REDIS_SETTING_FETCHED } from '../../../actions'

export const initialRedisSettingAdminState = {
  redisSettings: {
    redisSettings: [],
    skip: 0,
    limit: 100,
    total: 0,
    updateNeeded: true
  }
}

const immutableState = Immutable.fromJS(initialRedisSettingAdminState) as any

const adminRedisSettingReducer = (state = immutableState, action: any): any => {
  let result: any, updateMap: any
  switch (action.type) {
    case ADMIN_REDIS_SETTING_FETCHED:
      result = (action as RedisSettingRetrieved).list
      updateMap = new Map(state.get('redisSettings'))
      updateMap.set('redisSettings', result.data)
      updateMap.set('updateNeeded', false)

      return state.set('redisSettings', updateMap)
  }

  return state
}

export default adminRedisSettingReducer
