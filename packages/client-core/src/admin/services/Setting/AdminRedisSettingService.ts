import { Paginated } from '@feathersjs/feathers'

import { AdminRedisSetting } from '@xrengine/common/src/interfaces/AdminRedisSetting'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../../API'
import { NotificationService } from '../../../common/services/NotificationService'

const AdminRedisSettingsState = defineState({
  name: 'AdminRedisSettingsState',
  initial: () => ({
    redisSettings: [] as Array<AdminRedisSetting>,
    skip: 0,
    limit: 100,
    total: 0,
    updateNeeded: true
  })
})

const redisSettingRetrievedReceptor = (action: typeof AdminRedisSettingActions.redisSettingRetrieved.matches._TYPE) => {
  const state = getState(AdminRedisSettingsState)
  return state.merge({ redisSettings: action.adminRedisSetting.data, updateNeeded: false })
}

export const RedisSettingReceptors = {
  redisSettingRetrievedReceptor
}

export const accessAdminRedisSettingState = () => getState(AdminRedisSettingsState)

export const useAdminRedisSettingState = () => useState(accessAdminRedisSettingState())

export const AdminRedisSettingService = {
  fetchRedisSetting: async () => {
    try {
      const redisSetting = (await API.instance.client.service('redis-setting').find()) as Paginated<AdminRedisSetting>
      dispatchAction(AdminRedisSettingActions.redisSettingRetrieved({ adminRedisSetting: redisSetting }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class AdminRedisSettingActions {
  static redisSettingRetrieved = defineAction({
    type: 'xre.client.AdminRedisSetting.ADMIN_REDIS_SETTING_FETCHED' as const,
    adminRedisSetting: matches.object as Validator<unknown, Paginated<AdminRedisSetting>>
  })
}
