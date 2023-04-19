import { Paginated } from '@feathersjs/feathers'

import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { redisSettingPath, RedisSettingType } from '@etherealengine/engine/src/schemas/setting/redis-setting.schema'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../../API'
import { NotificationService } from '../../../common/services/NotificationService'

export const AdminRedisSettingsState = defineState({
  name: 'AdminRedisSettingsState',
  initial: () => ({
    redisSettings: [] as Array<RedisSettingType>,
    skip: 0,
    limit: 100,
    total: 0,
    updateNeeded: true
  })
})

const redisSettingRetrievedReceptor = (action: typeof AdminRedisSettingActions.redisSettingRetrieved.matches._TYPE) => {
  const state = getMutableState(AdminRedisSettingsState)
  return state.merge({ redisSettings: action.adminRedisSetting.data, updateNeeded: false })
}

export const RedisSettingReceptors = {
  redisSettingRetrievedReceptor
}

export const RedisSettingService = {
  fetchRedisSetting: async () => {
    try {
      const redisSetting = (await API.instance.client.service(redisSettingPath).find()) as Paginated<RedisSettingType>
      dispatchAction(AdminRedisSettingActions.redisSettingRetrieved({ adminRedisSetting: redisSetting }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class AdminRedisSettingActions {
  static redisSettingRetrieved = defineAction({
    type: 'ee.client.AdminRedisSetting.ADMIN_REDIS_SETTING_FETCHED' as const,
    adminRedisSetting: matches.object as Validator<unknown, Paginated<RedisSettingType>>
  })
}
