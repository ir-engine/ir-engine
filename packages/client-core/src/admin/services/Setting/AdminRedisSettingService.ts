import { Paginated } from '@feathersjs/feathers'
import { createState, useState } from '@speigg/hookstate'

import { AdminRedisSetting } from '@xrengine/common/src/interfaces/AdminRedisSetting'

//Action
import { AlertService } from '../../../common/services/AlertService'
import { client } from '../../../feathers'
import { store, useDispatch } from '../../../store'

//State
const state = createState({
  redisSettings: [] as Array<AdminRedisSetting>,
  skip: 0,
  limit: 100,
  total: 0,
  updateNeeded: true
})

store.receptors.push((action: AdminRedisSettingActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'ADMIN_REDIS_SETTING_FETCHED':
        return s.merge({ redisSettings: action.adminRedisSetting.data, updateNeeded: false })
    }
  }, action.type)
})

export const accessAdminRedisSettingState = () => state

export const useAdminRedisSettingState = () => useState(state) as any as typeof state

//Service
export const AdminRedisSettingService = {
  fetchRedisSetting: async () => {
    const dispatch = useDispatch()
    try {
      const redisSetting = (await client.service('redis-setting').find()) as Paginated<AdminRedisSetting>
      dispatch(AdminRedisSettingAction.redisSettingRetrieved(redisSetting))
    } catch (err) {
      AlertService.dispatchAlertError(err)
    }
  }
}

export const AdminRedisSettingAction = {
  redisSettingRetrieved: (adminRedisSetting: Paginated<AdminRedisSetting>) => {
    return {
      type: 'ADMIN_REDIS_SETTING_FETCHED' as const,
      adminRedisSetting: adminRedisSetting
    }
  }
}

export type AdminRedisSettingActionType = ReturnType<
  typeof AdminRedisSettingAction[keyof typeof AdminRedisSettingAction]
>
